"use client"

import { useState } from "react"
import { View, TextInput, TouchableOpacity, Text, Alert } from "react-native"
import { Feather } from "@expo/vector-icons"

interface CommentInputProps {
  isAuthenticated: boolean
  onSubmit: (text: string) => Promise<void>
  isSubmitting: boolean
}

export default function CommentInput({ isAuthenticated, onSubmit, isSubmitting }: CommentInputProps) {
  const [commentText, setCommentText] = useState("")

  const handleSubmit = async () => {
    if (!isAuthenticated || !commentText.trim()) {
      if (!isAuthenticated) {
        Alert.alert("Authentication Required", "Please log in to comment.")
      }
      return
    }

    try {
      await onSubmit(commentText.trim())
      setCommentText("")
    } catch (error) {
      console.error("Error submitting comment:", error)
    }
  }

  return (
    <View className="px-4 py-3 border-t border-gray-200 bg-white">
      <View className="flex-row items-center">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 mr-2"
          placeholder="Add a comment..."
          value={commentText}
          onChangeText={setCommentText}
          editable={!isSubmitting}
        />
        <TouchableOpacity
          className={`p-3 rounded-full ${
            commentText.trim() && isAuthenticated ? "bg-gradient-to-r from-[#ffd60a] to-[#bb0718]" : "bg-gray-300"
          }`}
          onPress={handleSubmit}
          disabled={isSubmitting || !commentText.trim() || !isAuthenticated}
        >
          <Feather name="send" size={20} color={commentText.trim() && isAuthenticated ? "white" : "#666"} />
        </TouchableOpacity>
      </View>
      {!isAuthenticated && <Text className="text-center text-sm text-red-500 mt-1">Please log in to comment</Text>}
    </View>
  )
}
