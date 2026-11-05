package com.northstar.forge.production;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface ProductionUpdateRepository extends JpaRepository<ProductionUpdate,Long>{List<ProductionUpdate> findTop100ByOrderByRecordedAtDesc();}
