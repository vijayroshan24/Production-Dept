package com.northstar.forge.api;
import com.northstar.forge.project.*; import com.northstar.forge.production.*; import com.northstar.forge.user.UserAccount; import jakarta.validation.Valid; import jakarta.validation.constraints.*; import org.springframework.http.HttpStatus; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*; import org.springframework.web.server.ResponseStatusException; import java.util.List;
@RestController @RequestMapping("/api/production/updates") public class ProductionController {
 private final ProductionUpdateRepository updates;private final ProjectRepository projects;public ProductionController(ProductionUpdateRepository u,ProjectRepository p){updates=u;projects=p;}
 record UpdateRequest(@NotNull Long projectId,@Positive int quantity,@NotBlank String shift,String note){}
 @GetMapping public List<ProductionUpdate> all(){return updates.findTop100ByOrderByRecordedAtDesc();}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public ProductionUpdate create(@Valid @RequestBody UpdateRequest b,Authentication auth){Project p=projects.findById(b.projectId()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Project not found"));p.addCompletedUnits(b.quantity());projects.save(p);return updates.save(new ProductionUpdate(p,b.quantity(),b.shift(),((UserAccount)auth.getPrincipal()).getName(),b.note()));}
}
