package ru.itmo.kursach_back.service.ai;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service("mockAIService")
@Primary // Use this by default if no API keys are configured
public class MockAIService extends AbstractAIService {

    private final Random random = new Random();

    @Override
    protected byte[] doGenerateImage(String prompt, Map<String, Object> parameters) throws Exception {
        Map<String, Object> params = mergeParameters(parameters);

        String sizeStr = (String) params.getOrDefault("size", "1024x1024");
        String[] dimensions = sizeStr.split("x");
        int width = Integer.parseInt(dimensions[0]);
        int height = Integer.parseInt(dimensions[1]);

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = image.createGraphics();

        Color bgColor = new Color(
            random.nextInt(100) + 150,
            random.nextInt(100) + 150,
            random.nextInt(100) + 150
        );
        g2d.setColor(bgColor);
        g2d.fillRect(0, 0, width, height);

        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setColor(Color.BLACK);
        g2d.setFont(new Font("Arial", Font.BOLD, Math.min(width, height) / 20));

        String displayText = "AI Generated (Mock)";
        FontMetrics fm = g2d.getFontMetrics();
        int textWidth = fm.stringWidth(displayText);
        int textX = (width - textWidth) / 2;
        int textY = height / 2 - 50;
        g2d.drawString(displayText, textX, textY);

        g2d.setFont(new Font("Arial", Font.PLAIN, Math.min(width, height) / 30));
        fm = g2d.getFontMetrics();
        String[] words = prompt.split(" ");
        StringBuilder line = new StringBuilder();
        int lineY = textY + 60;

        for (String word : words) {
            String testLine = line + word + " ";
            if (fm.stringWidth(testLine) > width - 100) {
                int lineX = (width - fm.stringWidth(line.toString())) / 2;
                g2d.drawString(line.toString(), lineX, lineY);
                line = new StringBuilder(word + " ");
                lineY += fm.getHeight();
            } else {
                line.append(word).append(" ");
            }
        }
        if (line.length() > 0) {
            int lineX = (width - fm.stringWidth(line.toString())) / 2;
            g2d.drawString(line.toString(), lineX, lineY);
        }

        g2d.setFont(new Font("Arial", Font.ITALIC, 14));
        g2d.setColor(new Color(0, 0, 0, 100));
        g2d.drawString("Mock AI Service - Configure real API for production", 20, height - 20);

        g2d.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", baos);

        Thread.sleep(500 + random.nextInt(1500));

        logger.info("Generated mock image for prompt: {}", prompt);
        return baos.toByteArray();
    }

    public boolean isAvailable() {
        return true;
    }

    public String getServiceName() {
        return "Mock AI Service";
    }

    public Map<String, Integer> getMaxDimensions() {
        Map<String, Integer> dimensions = new HashMap<>();
        dimensions.put("width", 2048);
        dimensions.put("height", 2048);
        return dimensions;
    }
}

