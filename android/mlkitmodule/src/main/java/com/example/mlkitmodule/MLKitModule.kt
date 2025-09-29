package com.matura.mlkitmodule

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.module.annotations.ReactModule

import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import com.google.mlkit.vision.common.InputImage
import android.net.Uri


@ReactModule(name = MLKitModule.NAME)
class MLKitModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "MLKitModule"
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun recognizeText(imagePath: String, promise: Promise) {
        try {
            // 1. Load image from file path
            val image = InputImage.fromFilePath(reactApplicationContext, Uri.parse(imagePath))

            // 2. Get recognizer instance
            val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

            // 3. Process image
            recognizer.process(image)
                .addOnSuccessListener { visionText ->
                    // Extract recognized text
                    val resultText = visionText.text
                    promise.resolve(resultText)
                }
                .addOnFailureListener { e ->
                    promise.reject("TEXT_RECOGNITION_FAILED", e)
                }
        } catch (e: Exception) {
            promise.reject("INPUT_IMAGE_ERROR", e)
        }
    }
}