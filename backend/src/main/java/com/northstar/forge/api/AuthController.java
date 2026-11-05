package com.northstar.forge.api;
import com.northstar.forge.user.UserAccount; import jakarta.servlet.http.*; import jakarta.validation.Valid; import jakarta.validation.constraints.*; import org.springframework.http.*; import org.springframework.security.authentication.*; import org.springframework.security.core.*; import org.springframework.security.core.context.*; import org.springframework.security.web.context.HttpSessionSecurityContextRepository; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") public class AuthController {
 private final AuthenticationManager manager; public AuthController(AuthenticationManager manager){this.manager=manager;}
 record LoginRequest(@Email @NotBlank String email,@NotBlank String password){} record UserDto(Long id,String name,String email,String role){}
 @PostMapping("/login") public UserDto login(@Valid @RequestBody LoginRequest body,HttpServletRequest request){Authentication auth=manager.authenticate(new UsernamePasswordAuthenticationToken(body.email(),body.password()));SecurityContext context=SecurityContextHolder.createEmptyContext();context.setAuthentication(auth);SecurityContextHolder.setContext(context);request.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,context);return dto((UserAccount)auth.getPrincipal());}
 @GetMapping("/me") public UserDto me(Authentication auth){return dto((UserAccount)auth.getPrincipal());}
 @PostMapping("/logout") public ResponseEntity<Void> logout(HttpSession session){SecurityContextHolder.clearContext();session.invalidate();return ResponseEntity.noContent().build();}
 private UserDto dto(UserAccount u){return new UserDto(u.getId(),u.getName(),u.getEmail(),u.getRole());}
}
