package com.melardev.spring.jwtoauth.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.melardev.spring.jwtoauth.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import org.springframework.util.StringUtils;

@Service
@Profile("!test") // Don't load this service in test profile
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

	@Value("${file.upload-dir:uploads}")
	private String uploadDir;

	@Value("${backend.base-url:http://localhost:8081}")
	private String backendBaseUrl;

    @Autowired
    public CloudinaryServiceImpl(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public Map<String, Object> upload(MultipartFile file, String folder) throws IOException {
		try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(),
					ObjectUtils.asMap(
							"folder", folder,
							"resource_type", "auto"
					));
            return response;
		} catch (Exception ex) {
			// Fallback to local storage when Cloudinary is unreachable
			return saveLocally(file, folder);
		}
	}

    @Override
    public String uploadImage(MultipartFile file) throws IOException {
        Map<String, Object> result = upload(file, "profile_images");
        return (String) result.get("url");
    }

	@Override
    public Map<String, Object> uploadWithPreset(MultipartFile file, String folder, String preset) throws IOException {
		try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(),
					ObjectUtils.asMap(
							"folder", folder,
							"upload_preset", preset,
							"resource_type", "auto"
					));
            return response;
		} catch (Exception ex) {
			// Fallback to local storage when Cloudinary is unreachable
			return saveLocally(file, folder);
		}
	}

	@Override
    public String uploadPdf(MultipartFile file, String preset) throws IOException {
		int attempts = 0;
		long[] backoffMs = new long[]{250, 500, 1000};
		Exception last;
		do {
			try {
				Map<String, Object> options = new HashMap<>();
				options.put("folder", "preojt_orientations");
                // PDFs are best uploaded as raw assets in Cloudinary
                options.put("resource_type", "raw");
				options.put("access_mode", "public");
				options.put("use_filename", true);
				options.put("unique_filename", true);
                // Do not send upload_preset from server-side uploads in signed mode
				@SuppressWarnings("unchecked")
				Map<String, Object> result = (Map<String, Object>) cloudinary.uploader().upload(
						file.getBytes(), options);
				Object secureUrl = result.get("secure_url");
				Object url = result.get("url");
				String finalUrl = secureUrl != null ? secureUrl.toString() : (url != null ? url.toString() : null);
				if (finalUrl == null) {
					throw new IOException("Cloudinary upload succeeded but no URL returned");
				}
				return finalUrl;
			} catch (Exception ex) {
				last = ex;
				if (attempts < backoffMs.length) {
					try { Thread.sleep(backoffMs[attempts]); } catch (InterruptedException ignored) {}
				}
			}
			attempts++;
		} while (attempts <= backoffMs.length);
		throw new IOException("Cloudinary upload failed for PreOJT Orientation: " + last.getMessage(), last);
	}

    @Override
    public void delete(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    private Map<String, Object> saveLocally(MultipartFile file, String folder) throws IOException {
		Path targetFolder = Paths.get(uploadDir, folder);
		Files.createDirectories(targetFolder);

		String originalFilename = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "file"));
		String extension = "";
		int dotIndex = originalFilename.lastIndexOf('.');
		if (dotIndex != -1) {
			extension = originalFilename.substring(dotIndex);
		}

		String uniqueName = UUID.randomUUID().toString() + extension;
		Path destination = targetFolder.resolve(uniqueName);
		Files.write(destination, file.getBytes(), StandardOpenOption.CREATE_NEW);

        String baseUrl = backendBaseUrl != null ? backendBaseUrl.replaceAll("/+$", "") : "";
		String url = baseUrl + "/uploads/" + folder + "/" + uniqueName;

        Map<String, Object> map = new HashMap<>();
		map.put("url", url);
		map.put("secure_url", url);
		map.put("public_id", uniqueName);
		return map;
	}
}