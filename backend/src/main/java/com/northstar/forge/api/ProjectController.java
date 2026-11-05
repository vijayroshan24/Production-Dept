package com.northstar.forge.api;

import com.northstar.forge.project.Project;
import com.northstar.forge.project.ProjectRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectRepository projects;

    public ProjectController(ProjectRepository projects) {
        this.projects = projects;
    }

    record ProjectRequest(
        @NotBlank String name,
        @NotBlank String code,
        @NotBlank String manager,
        @NotBlank String assemblyLine,
        @Positive int targetUnits,
        @NotNull LocalDate dueDate,
        String status,
        Integer completedUnits
    ) {}

    @GetMapping
    public List<Project> all() {
        return projects.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Project create(@Valid @RequestBody ProjectRequest body) {
        if (projects.existsByCode(body.code())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Project code already exists");
        }

        Project project = new Project(
            body.name(),
            body.code(),
            body.manager(),
            body.assemblyLine(),
            body.targetUnits(),
            body.dueDate()
        );

        if (body.status() != null) {
            project.setStatus(body.status());
        }
        if (body.completedUnits() != null) {
            project.setCompletedUnits(body.completedUnits());
        }

        return projects.save(project);
    }

    @GetMapping("/{id}")
    public Project one(@PathVariable Long id) {
        return projects.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public Project update(@PathVariable Long id, @Valid @RequestBody ProjectRequest body) {
        Project project = projects.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!project.getCode().equals(body.code()) && projects.existsByCode(body.code())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Project code already exists");
        }

        project.setName(body.name());
        project.setCode(body.code());
        project.setManager(body.manager());
        project.setAssemblyLine(body.assemblyLine());
        project.setTargetUnits(body.targetUnits());
        project.setDueDate(body.dueDate());
        if (body.status() != null) {
            project.setStatus(body.status());
        }
        if (body.completedUnits() != null) {
            project.setCompletedUnits(body.completedUnits());
        }

        return projects.save(project);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Project project = projects.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        projects.delete(project);
        return ResponseEntity.noContent().build();
    }
}
