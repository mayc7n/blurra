package expo.modules.blurrasubjectsegmentation

import android.graphics.Bitmap
import android.graphics.Color
import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.segmentation.Segmentation
import com.google.mlkit.vision.segmentation.SegmentationMask
import com.google.mlkit.vision.segmentation.selfie.SelfieSegmenterOptions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileOutputStream
import java.util.UUID
import kotlin.math.abs
import kotlin.math.roundToInt

class BlurraSubjectSegmentationModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("BlurraSubjectSegmentation")

    AsyncFunction("segment") { sourceUri: String, promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.reject("E_CONTEXT", "O contexto do aplicativo não está disponível.", null)
        return@AsyncFunction
      }

      val inputImage = try {
        InputImage.fromFilePath(context, toUri(sourceUri))
      } catch (error: Exception) {
        promise.reject("E_SOURCE", "Não foi possível ler a foto local.", error)
        return@AsyncFunction
      }

      val options = SelfieSegmenterOptions.Builder()
        .setDetectorMode(SelfieSegmenterOptions.SINGLE_IMAGE_MODE)
        .build()
      val segmenter = Segmentation.getClient(options)

      segmenter.process(inputImage)
        .addOnSuccessListener { mask ->
          try {
            promise.resolve(writeBackgroundMask(mask, appContext.cacheDirectory))
          } catch (error: Exception) {
            promise.reject("E_OUTPUT", "Não foi possível salvar a máscara local.", error)
          } finally {
            segmenter.close()
          }
        }
        .addOnFailureListener { error ->
          segmenter.close()
          promise.reject("E_SEGMENTATION", "Não foi possível encontrar um sujeito na foto.", error)
        }
    }
  }

  private fun toUri(sourceUri: String): Uri {
    return if (sourceUri.contains("://")) Uri.parse(sourceUri) else Uri.fromFile(File(sourceUri))
  }

  private fun writeBackgroundMask(mask: SegmentationMask, cacheDirectory: File): Map<String, Any> {
    val width = mask.width
    val height = mask.height
    require(width > 0 && height > 0) { "A máscara retornou dimensões inválidas." }

    val confidences = FloatArray(width * height)
    mask.buffer.rewind()
    mask.buffer.asFloatBuffer().get(confidences)

    val pixels = IntArray(confidences.size)
    var certainty = 0.0
    var foregroundPixels = 0
    confidences.forEachIndexed { index, rawConfidence ->
      val foregroundConfidence = rawConfidence.coerceIn(0f, 1f).toDouble()
      val backgroundAlpha = ((1.0 - foregroundConfidence) * 255.0).roundToInt().coerceIn(0, 255)
      pixels[index] = Color.argb(backgroundAlpha, 255, 255, 255)
      certainty += abs(foregroundConfidence - 0.5) * 2.0
      if (foregroundConfidence >= 0.5) foregroundPixels += 1
    }

    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    try {
      bitmap.setPixels(pixels, 0, width, 0, 0, width, height)
      val directory = File(cacheDirectory, "blurra-masks").apply { mkdirs() }
      val file = File(directory, "mask-${UUID.randomUUID()}.png")
      FileOutputStream(file).use { output ->
        check(bitmap.compress(Bitmap.CompressFormat.PNG, 100, output)) {
          "A máscara não pôde ser codificada."
        }
      }

      return mapOf(
        "maskUri" to Uri.fromFile(file).toString(),
        "width" to width,
        "height" to height,
        "confidence" to certainty / confidences.size,
        "foregroundCoverage" to foregroundPixels.toDouble() / confidences.size,
      )
    } finally {
      bitmap.recycle()
    }
  }
}
