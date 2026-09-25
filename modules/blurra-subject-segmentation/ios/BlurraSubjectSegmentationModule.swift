import ExpoModulesCore
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
import Vision

public class BlurraSubjectSegmentationModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BlurraSubjectSegmentation")

    AsyncFunction("segment") { (sourceUri: String, promise: Promise) in
      guard #available(iOS 15.0, *), let url = sourceUrl(from: sourceUri) else {
        promise.reject("E_SOURCE", "Não foi possível ler a foto local.")
        return
      }

      do {
        let request = VNGeneratePersonSegmentationRequest()
        request.qualityLevel = .accurate
        request.outputPixelFormat = kCVPixelFormatType_OneComponent8
        let handler = VNImageRequestHandler(url: url, options: [:])
        try handler.perform([request])

        guard let observation = request.results?.first else {
          promise.reject("E_SEGMENTATION", "Nenhuma pessoa foi encontrada.")
          return
        }

        promise.resolve(try writeBackgroundMask(observation.pixelBuffer))
      } catch {
        promise.reject("E_SEGMENTATION", error.localizedDescription)
      }
    }
  }

  @available(iOS 15.0, *)
  private func sourceUrl(from sourceUri: String) -> URL? {
    if let url = URL(string: sourceUri), url.isFileURL {
      return url
    }
    return URL(fileURLWithPath: sourceUri)
  }

  @available(iOS 15.0, *)
  private func writeBackgroundMask(_ pixelBuffer: CVPixelBuffer) throws -> [String: Any] {
    CVPixelBufferLockBaseAddress(pixelBuffer, .readOnly)
    defer { CVPixelBufferUnlockBaseAddress(pixelBuffer, .readOnly) }

    let width = CVPixelBufferGetWidth(pixelBuffer)
    let height = CVPixelBufferGetHeight(pixelBuffer)
    guard let baseAddress = CVPixelBufferGetBaseAddress(pixelBuffer) else {
      throw SegmentationError.invalidMask
    }

    let source = baseAddress.assumingMemoryBound(to: UInt8.self)
    var output = [UInt8](repeating: 0, count: width * height * 4)
    var certainty = 0.0
    var foregroundPixels = 0

    for index in 0..<(width * height) {
      let foregroundConfidence = Double(source[index]) / 255.0
      let backgroundAlpha = UInt8(max(0, min(255, Int((1.0 - foregroundConfidence) * 255.0))))
      output[index * 4] = 255
      output[index * 4 + 1] = 255
      output[index * 4 + 2] = 255
      output[index * 4 + 3] = backgroundAlpha
      certainty += abs(foregroundConfidence - 0.5) * 2.0
      if foregroundConfidence >= 0.5 { foregroundPixels += 1 }
    }

    guard let image = output.withUnsafeMutableBytes({ buffer in
      guard let context = CGContext(
        data: buffer.baseAddress,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: width * 4,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.last.rawValue | CGBitmapInfo.byteOrder32Big.rawValue
      ) else { return nil }
      return context.makeImage()
    }) else {
      throw SegmentationError.invalidMask
    }

    let directory = try FileManager.default.url(for: .cachesDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
      .appendingPathComponent("blurra-masks", isDirectory: true)
    try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    let fileUrl = directory.appendingPathComponent("mask-\(UUID().uuidString).png")
    guard let destination = CGImageDestinationCreateWithURL(fileUrl as CFURL, UTType.png.identifier as CFString, 1, nil) else {
      throw SegmentationError.invalidOutput
    }
    CGImageDestinationAddImage(destination, image, nil)
    guard CGImageDestinationFinalize(destination) else {
      throw SegmentationError.invalidOutput
    }

    return [
      "maskUri": fileUrl.absoluteString,
      "width": width,
      "height": height,
      "confidence": certainty / Double(width * height),
      "foregroundCoverage": Double(foregroundPixels) / Double(width * height),
    ]
  }
}

private enum SegmentationError: Error {
  case invalidMask
  case invalidOutput
}
