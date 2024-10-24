package org.example;

import com.fastcgi.*;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;

import static com.fastcgi.FCGIInterface.request;
import static java.lang.Math.abs;

public class Main {
    private final static HashMap<Integer, String> statusHeaders = new HashMap<>();

    private static String res(Integer statusCode, String content) {
        return statusHeaders.get(statusCode).formatted(content.getBytes(StandardCharsets.UTF_8).length, content);
    }

    private static void initHeaders() {
        statusHeaders.put(200, """
                HTTP/1.1 200 OK
                Content-Type: text/html
                Content-Length: %d
                
                %s""");
        statusHeaders.put(403, """
                HTTP/1.1 403 Forbidden
                Content-Type: text/html
                Content-Length: %d
                
                %s""");
        statusHeaders.put(404, """
                HTTP/1.1 404 Not Found
                Content-Type: text/html
                Content-Length: %d
                
                %s""");
        statusHeaders.put(500, """
                HTTP/1.1 500 Internal Server Error
                Content-Type: text/html
                Content-Length: %d
                
                %s""");

    }


    private static boolean checkIfDotBelongsToFigure(int x, float y, float r) {
        // окружность
        if (x >= 0 && y >= 0 && (x * x + y * y <= r * r)) return true;

        // треугольник
        if (((x + r)) /2 >= y && x <= 0 && y >= 0) return true;

        // прямоугольник
        if (y <= 0 && x >= -r && x <= 0 && y >= (float) -r / 2) return true;

        return false;
    }

    private static String readRequestBody() throws IOException {
        FCGIInterface.request.inStream.fill();
        var contentLength = FCGIInterface.request.inStream.available();
        var buffer = ByteBuffer.allocate(contentLength);
        var readBytes = FCGIInterface.request.inStream.read(buffer.array(), 0, contentLength);
        var requestBodyRaw = new byte[readBytes];
        buffer.get(requestBodyRaw);
        buffer.clear();
        return new String(requestBodyRaw, StandardCharsets.UTF_8);
    }

    public static void main(String[] args) {
        initHeaders();
        var fcgiInterface = new FCGIInterface();
        while (fcgiInterface.FCGIaccept() >= 0) {
            LocalDate requestGotTime = LocalDate.now();
            long startTime = System.nanoTime();
            String content = null;
            try {
                String post_data = readRequestBody();
                String[] splitted_data = post_data.split("&");
                String[] xyr_data = new String[3];
                for (int i = 0; i < splitted_data.length; i++)
                    xyr_data[i] = splitted_data[i].split("=")[1];

                int x = Integer.parseInt(xyr_data[0]);
                float y = Float.parseFloat(xyr_data[1]);
                float r = Float.parseFloat(xyr_data[2]);


                String intersects = "Нет";
                if (checkIfDotBelongsToFigure(x, y, r)) intersects = "Да";


                content = """
                        {\"intersects\": \"%s\", \"exec_time\": \"%s\", \"exec_date\": \"%s\", \"x\": \"empty_field\"}
                        """.formatted(intersects, (System.nanoTime() - startTime), requestGotTime.toString());
                System.out.println(res(200, content));
            } catch (IOException e) {
                System.out.println(res(500, "{\"message\": \"Something bad happened.\"}"));
                continue;
            }
        }
    }
}