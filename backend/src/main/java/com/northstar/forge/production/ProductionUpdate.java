package com.northstar.forge.production;
import jakarta.persistence.*; import java.time.Instant; import com.northstar.forge.project.Project;
@Entity @Table(name="production_updates") public class ProductionUpdate {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(optional=false,fetch=FetchType.EAGER) private Project project; @Column(nullable=false) private int quantity; @Column(nullable=false) private String shift; @Column(nullable=false) private String recordedBy; @Column(nullable=false,updatable=false) private Instant recordedAt=Instant.now(); private String note;
 protected ProductionUpdate(){} public ProductionUpdate(Project p,int q,String s,String by,String n){project=p;quantity=q;shift=s;recordedBy=by;note=n;}
 public Long getId(){return id;} public Project getProject(){return project;} public int getQuantity(){return quantity;} public String getShift(){return shift;} public String getRecordedBy(){return recordedBy;} public Instant getRecordedAt(){return recordedAt;} public String getNote(){return note;}
}
