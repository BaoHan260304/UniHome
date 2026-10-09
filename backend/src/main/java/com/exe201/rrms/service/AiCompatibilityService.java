package com.exe201.rrms.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
public class AiCompatibilityService {
    @Value("${unihome.ai.gemini-key:}") private String apiKey;
    @Value("${unihome.ai.gemini-model:gemini-2.5-flash}") private String model;
    private final ObjectMapper mapper;

    public AiCompatibilityService(ObjectMapper mapper) { this.mapper = mapper; }

    /**
     * The percentage is intentionally NOT invented by the LLM. The deterministic scoring
     * engine owns the score so the same pair receives a stable result. AI only turns the
     * structured strengths/conflicts into a concise, human-readable explanation.
     */
    public String explain(int score, List<String> strengths, List<String> conflicts) {
        String fallback = fallback(score, strengths, conflicts);
        if (apiKey == null || apiKey.isBlank()) return fallback;
        try {
            String prompt = "Bạn là trợ lý UniHome. Viết 2-3 câu tiếng Việt giải thích mức tương hợp ở ghép. " +
                    "Không nhắc chiêm tinh, cung hoàng đạo hay suy diễn thông tin nhạy cảm. " +
                    "Điểm đã được hệ thống tính cố định là " + score + "%. Điểm phù hợp: " + strengths +
                    ". Điểm cần trao đổi: " + conflicts + ". Chỉ giải thích, không thay đổi phần trăm.";
            Map<String,Object> body = Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)))
                    .build();
            HttpResponse<String> res = HttpClient.newHttpClient().send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() < 200 || res.statusCode() >= 300) return fallback;
            JsonNode root = mapper.readTree(res.body());
            String text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asString("");
            return text == null || text.isBlank() ? fallback : text.trim();
        } catch (Exception ignored) {
            return fallback;
        }
    }

    private String fallback(int score, List<String> strengths, List<String> conflicts) {
        StringBuilder x = new StringBuilder("Mức tương hợp ").append(score).append("%. ");
        if (!strengths.isEmpty()) x.append("Điểm phù hợp: ").append(String.join(", ", strengths)).append(". ");
        if (!conflicts.isEmpty()) x.append("Nên trao đổi trước về: ").append(String.join(", ", conflicts)).append(".");
        return x.toString();
    }
}
