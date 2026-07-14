package com.learningportal.app.repository;

import com.learningportal.app.entity.WatchProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchProgressRepository extends JpaRepository<WatchProgress, Long> {

    Optional<WatchProgress> findByUserIdAndVideoId(Long userId, Long videoId);

    // Recently watched videos for a user (ordered by last watched)
    @Query("SELECT wp FROM WatchProgress wp JOIN FETCH wp.video WHERE wp.user.id = :userId " +
           "ORDER BY wp.lastWatchedAt DESC")
    List<WatchProgress> findRecentlyWatchedByUserId(@Param("userId") Long userId);

    // In-progress videos (not completed)
    @Query("SELECT wp FROM WatchProgress wp JOIN FETCH wp.video WHERE wp.user.id = :userId " +
           "AND wp.completed = false AND wp.progressPercent > 0 " +
           "ORDER BY wp.lastWatchedAt DESC")
    List<WatchProgress> findContinueWatchingByUserId(@Param("userId") Long userId);

    // Completed videos
    @Query("SELECT wp FROM WatchProgress wp JOIN FETCH wp.video WHERE wp.user.id = :userId " +
           "AND wp.completed = true ORDER BY wp.lastWatchedAt DESC")
    List<WatchProgress> findCompletedByUserId(@Param("userId") Long userId);
}
