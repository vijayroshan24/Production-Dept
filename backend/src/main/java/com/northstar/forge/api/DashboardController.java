package com.northstar.forge.api;
import com.northstar.forge.project.*; import com.northstar.forge.production.*; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api") public class DashboardController {
 private final ProjectRepository projects;private final ProductionUpdateRepository updates;public DashboardController(ProjectRepository p,ProductionUpdateRepository u){projects=p;updates=u;}
 @GetMapping("/dashboard/summary") public Map<String,Object> summary(){var all=projects.findAll();return Map.of("activeProjects",all.size(),"unitsCompleted",all.stream().mapToInt(Project::getCompletedUnits).sum(),"targetUnits",all.stream().mapToInt(Project::getTargetUnits).sum(),"onTrack",all.stream().filter(p->p.getStatus().equals("ON_TRACK")).count(),"atRisk",all.stream().filter(p->p.getStatus().equals("AT_RISK")).count(),"delayed",all.stream().filter(p->p.getStatus().equals("DELAYED")).count(),"recentUpdates",updates.findTop100ByOrderByRecordedAtDesc().size());}
 @GetMapping("/health") public Map<String,String> health(){return Map.of("status","ok");}
}
