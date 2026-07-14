package com.learningportal.app.service;

import com.learningportal.app.dto.VideoDTO;
import com.learningportal.app.entity.Video;
import com.learningportal.app.entity.WatchProgress;
import com.learningportal.app.repository.BookmarkRepository;
import com.learningportal.app.repository.VideoRepository;
import com.learningportal.app.repository.WatchProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VideoService {

    private final VideoRepository videoRepository;
    private final WatchProgressRepository watchProgressRepository;
    private final BookmarkRepository bookmarkRepository;

    public List<VideoDTO> getAllVideos(Long userId) {
        return videoRepository.findByActiveTrue().stream()
                .map(v -> toDTO(v, userId))
                .collect(Collectors.toList());
    }

    public VideoDTO getVideoById(Long videoId, Long userId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new IllegalArgumentException("Video not found with id: " + videoId));
        return toDTO(video, userId);
    }

    public List<VideoDTO> searchVideos(String query, Long userId) {
        return videoRepository.searchVideos(query).stream()
                .map(v -> toDTO(v, userId))
                .collect(Collectors.toList());
    }

    public List<VideoDTO> getVideosBySubject(String subject, Long userId) {
        return videoRepository.findBySubjectIgnoreCaseAndActiveTrue(subject).stream()
                .map(v -> toDTO(v, userId))
                .collect(Collectors.toList());
    }

    public List<String> getAllSubjects() {
        return videoRepository.findAllSubjects();
    }

    private VideoDTO toDTO(Video video, Long userId) {
        VideoDTO dto = VideoDTO.builder()
                .id(video.getId())
                .title(video.getTitle())
                .description(video.getDescription())
                .videoUrl(video.getVideoUrl())
                .thumbnailUrl(video.getThumbnailUrl())
                .subject(video.getSubject())
                .instructor(video.getInstructor())
                .durationSeconds(video.getDurationSeconds())
                .createdAt(video.getCreatedAt())
                .build();

        if (userId != null) {
            Optional<WatchProgress> progress = watchProgressRepository.findByUserIdAndVideoId(userId, video.getId());
            progress.ifPresent(wp -> {
                dto.setProgressSeconds(wp.getProgressSeconds());
                dto.setProgressPercent(wp.getProgressPercent());
                dto.setCompleted(wp.isCompleted());
            });
            dto.setBookmarkCount((int) bookmarkRepository.countByUserIdAndVideoId(userId, video.getId()));
        }

        return dto;
    }
}
