package com.learningportal.app.repository;

import com.learningportal.app.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    List<Video> findByActiveTrue();

    List<Video> findBySubjectIgnoreCaseAndActiveTrue(String subject);

    @Query("SELECT v FROM Video v WHERE v.active = true AND " +
           "(LOWER(v.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(v.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(v.subject) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(v.instructor) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Video> searchVideos(@Param("query") String query);

    @Query("SELECT DISTINCT v.subject FROM Video v WHERE v.active = true AND v.subject IS NOT NULL")
    List<String> findAllSubjects();
}
