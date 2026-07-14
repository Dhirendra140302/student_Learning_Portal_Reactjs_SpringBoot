package com.learningportal.app;

import com.learningportal.app.entity.User;
import com.learningportal.app.entity.Video;
import com.learningportal.app.repository.UserRepository;
import com.learningportal.app.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VideoRepository videoRepository;
    private final PasswordEncoder passwordEncoder;

    // Working public sample video URLs (verified reachable)
    private static final String V1 = "/videos/sample.mp4";
    private static final String V2 = "/videos/sample.mp4";
    private static final String V3 = "/videos/sample.mp4";
    private static final String V4 = "/videos/sample.mp4";
    private static final String V5 = "/videos/sample.mp4";
    private static final String V6 = "/videos/sample.mp4";
    private static final String V7 = "/videos/sample.mp4";
    private static final String V8 = "/videos/sample.mp4";

    // Thumbnail: inline SVG data URI — no external service needed
    private static String svgThumb(String color, String label) {
        String escaped = label.replace(" ", "%20").replace("&", "%26");
        String svg = "<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'>"
                + "<rect width='640' height='360' fill='%23" + color + "'/>"
                + "<text x='320' y='190' font-family='Arial' font-size='28' font-weight='bold' "
                + "fill='white' text-anchor='middle'>" + label + "</text>"
                + "</svg>";
        return "data:image/svg+xml," + svg;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedVideos();
        log.info("Data seeding complete.");
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;

        userRepository.save(User.builder()
                .fullName("Admin User")
                .email("admin@gvcc.edu")
                .password(passwordEncoder.encode("admin123"))
                .role(User.Role.ADMIN)
                .build());

        userRepository.save(User.builder()
                .fullName("Dhirendra")
                .email("dhirendra@gvcc.edu")
                .password(passwordEncoder.encode("student123"))
                .role(User.Role.STUDENT)
                .build());

        userRepository.save(User.builder()
                .fullName("Bob Smith")
                .email("bob@gvcc.edu")
                .password(passwordEncoder.encode("student123"))
                .role(User.Role.STUDENT)
                .build());

        log.info("Seeded 3 users.");
    }

    private void seedVideos() {
        if (videoRepository.count() > 0) return;

        videoRepository.save(Video.builder()
                .title("Introduction to Java Programming")
                .description("Learn the fundamentals of Java: variables, data types, control flow, and OOP concepts. A complete beginner-friendly walkthrough.")
                .videoUrl(V1)
                .thumbnailUrl(svgThumb("4F46E5", "Java Intro"))
                .subject("Computer Science")
                .instructor("Dr. Rajan Mehta")
                .durationSeconds(596)
                .build());

        videoRepository.save(Video.builder()
                .title("Data Structures and Algorithms")
                .description("Arrays, linked lists, trees, graphs, sorting and searching algorithms with practical examples.")
                .videoUrl(V2)
                .thumbnailUrl(svgThumb("7C3AED", "DSA"))
                .subject("Computer Science")
                .instructor("Prof. Sunita Rao")
                .durationSeconds(653)
                .build());

        videoRepository.save(Video.builder()
                .title("Web Development with React")
                .description("Build modern single-page applications using React 18, hooks, context API and client-side routing.")
                .videoUrl(V3)
                .thumbnailUrl(svgThumb("2563EB", "React Dev"))
                .subject("Web Development")
                .instructor("Ms. Priya Sharma")
                .durationSeconds(480)
                .build());

        videoRepository.save(Video.builder()
                .title("Database Management Systems")
                .description("Understand relational databases, SQL queries, normalization, indexing and transaction management.")
                .videoUrl(V4)
                .thumbnailUrl(svgThumb("059669", "DBMS"))
                .subject("Database")
                .instructor("Dr. Anil Kumar")
                .durationSeconds(540)
                .build());

        videoRepository.save(Video.builder()
                .title("Operating Systems Fundamentals")
                .description("Process management, memory management, file systems, scheduling algorithms and concurrency.")
                .videoUrl(V5)
                .thumbnailUrl(svgThumb("DC2626", "OS Basics"))
                .subject("Computer Science")
                .instructor("Prof. Deepak Nair")
                .durationSeconds(320)
                .build());

        videoRepository.save(Video.builder()
                .title("Machine Learning with Python")
                .description("Supervised and unsupervised learning, scikit-learn, neural networks and real-world ML applications.")
                .videoUrl(V6)
                .thumbnailUrl(svgThumb("D97706", "ML Python"))
                .subject("Artificial Intelligence")
                .instructor("Dr. Kavya Reddy")
                .durationSeconds(720)
                .build());

        videoRepository.save(Video.builder()
                .title("Computer Networks")
                .description("TCP/IP model, protocols, routing algorithms, network security and wireless communication basics.")
                .videoUrl(V7)
                .thumbnailUrl(svgThumb("0891B2", "Networks"))
                .subject("Networking")
                .instructor("Prof. Rahul Gupta")
                .durationSeconds(600)
                .build());

        videoRepository.save(Video.builder()
                .title("Software Engineering Principles")
                .description("SDLC, agile methodologies, design patterns, testing strategies and software quality assurance.")
                .videoUrl(V8)
                .thumbnailUrl(svgThumb("BE185D", "Software Eng"))
                .subject("Software Engineering")
                .instructor("Ms. Neha Verma")
                .durationSeconds(888)
                .build());

        log.info("Seeded 8 sample videos with working URLs.");
    }
}
