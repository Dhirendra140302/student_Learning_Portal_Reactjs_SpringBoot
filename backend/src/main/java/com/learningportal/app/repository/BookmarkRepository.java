package com.learningportal.app.repository;

import com.learningportal.app.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    // All bookmarks for a user on a specific video, sorted by timestamp
    List<Bookmark> findByUserIdAndVideoIdOrderByTimestampSecondsAsc(Long userId, Long videoId);

    // All bookmarks for a user across all videos
    @Query("SELECT b FROM Bookmark b JOIN FETCH b.video WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Bookmark> findByUserIdWithVideo(@Param("userId") Long userId);

    // Count bookmarks per video for a user
    long countByUserIdAndVideoId(Long userId, Long videoId);

    // Verify ownership
    Optional<Bookmark> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
