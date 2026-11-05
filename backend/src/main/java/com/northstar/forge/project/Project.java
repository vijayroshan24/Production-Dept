package com.northstar.forge.project;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    private String manager;
    private String assemblyLine;

    @Column(nullable = false)
    private int targetUnits;

    @Column(nullable = false)
    private int completedUnits = 0;

    private LocalDate dueDate;

    @Column(nullable = false)
    private String status = "ON_TRACK";

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Project() {
    }

    public Project(String name, String code, String manager, String assemblyLine, int targetUnits, LocalDate dueDate) {
        this.name = name;
        this.code = code;
        this.manager = manager;
        this.assemblyLine = assemblyLine;
        this.targetUnits = targetUnits;
        this.dueDate = dueDate;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCode() { return code; }
    public String getManager() { return manager; }
    public String getAssemblyLine() { return assemblyLine; }
    public int getTargetUnits() { return targetUnits; }
    public int getCompletedUnits() { return completedUnits; }
    public LocalDate getDueDate() { return dueDate; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }

    public void setName(String name) { this.name = name; }
    public void setCode(String code) { this.code = code; }
    public void setManager(String manager) { this.manager = manager; }
    public void setAssemblyLine(String assemblyLine) { this.assemblyLine = assemblyLine; }
    public void setTargetUnits(int targetUnits) { this.targetUnits = targetUnits; }
    public void setCompletedUnits(int completedUnits) { this.completedUnits = completedUnits; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public void setStatus(String status) { this.status = status; }
    public void addCompletedUnits(int amount) { this.completedUnits += amount; }
}
