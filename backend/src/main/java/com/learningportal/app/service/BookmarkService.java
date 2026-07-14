package com.learningportal.app.service;

import com.learningportal.app.dto.BookmarkDTO;
import com.learningportal.app.dto.BookmarkRequest;
import com.learningportal.app.entity.Bookmark;
import com.learningportal.app.entity.User;
import com.learningportal.app.entity.Video;
import com.learningportal.app.repository.BookmarkRepository;
import com.learningportal.app.repository.UserRepository;
import com.learningportal.app.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final VideoRepository videoRepository;

    @Transactional(readOnly = true)
    public List<BookmarkDTO> getBookmarksForVideo(Long userId, Long videoId) {
        return bookmarkRepository
                .findByUserIdAndVideoIdOrderByTimestampSecondsAsc(userId, videoId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookmarkDTO> getAllBookmarksForUser(Long userId) {
        return bookmarkRepository.findByUserIdWithVideo(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookmarkDTO createBookmark(Long userId, BookmarkRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Video video = videoRepository.findById(request.getVideoId())
                .orElseThrow(() -> new IllegalArgumentException("Video not found"));

        Bookmark bookmark = Bookmark.builder()
                .name(request.getName())
                .notes(request.getNotes())
                .timestampSeconds(request.getTimestampSeconds())
                .user(user)
                .video(video)
                .build();

        return toDTO(bookmarkRepository.save(bookmark));
    }

    @Transactional
    public BookmarkDTO updateBookmark(Long userId, Long bookmarkId, BookmarkRequest request) {
        Bookmark bookmark = bookmarkRepository.findByIdAndUserId(bookmarkId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Bookmark not found or access denied"));

        bookmark.setName(request.getName());
        bookmark.setNotes(request.getNotes());
        bookmark.setTimestampSeconds(request.getTimestampSeconds());

        return toDTO(bookmarkRepository.save(bookmark));
    }

    @Transactional
    public void deleteBookmark(Long userId, Long bookmarkId) {
        Bookmark bookmark = bookmarkRepository.findByIdAndUserId(bookmarkId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Bookmark not found or access denied"));
        bookmarkRepository.delete(bookmark);
    }

    private BookmarkDTO toDTO(Bookmark bookmark) {
        return BookmarkDTO.builder()
                .id(bookmark.getId())
                .name(bookmark.getName())
                .notes(bookmark.getNotes())
                .timestampSeconds(bookmark.getTimestampSeconds())
                .videoId(bookmark.getVideo().getId())
                .videoTitle(bookmark.getVideo().getTitle())
                .videoThumbnailUrl(bookmark.getVideo().getThumbnailUrl())
                .createdAt(bookmark.getCreatedAt())
                .updatedAt(bookmark.getUpdatedAt())
                .build();
    }
}
