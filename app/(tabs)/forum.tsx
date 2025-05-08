import { IconSymbol } from "@/components/ui/IconSymbol";
import { Image } from "expo-image";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForumScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#FF0000" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#FF0000"
          />
        </View>

        {/* Category Filters */}
        <View style={styles.categoryContainer}>
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.categoryText}>Main dish</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.categoryText}>Dessert</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.categoryText}>Appetite</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Options */}
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Rating</Text>
            <IconSymbol name="star.fill" size={16} color="#FFCC00" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Newest</Text>
            <IconSymbol name="calendar" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Best</Text>
            <IconSymbol name="flame.fill" size={16} color="#FFCC00" />
          </TouchableOpacity>
        </View>

        {/* Post */}
        <View style={styles.postContainer}>
          {/* User Info */}
          <View style={styles.userInfoContainer}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <IconSymbol
                  name="person.circle.fill"
                  size={24}
                  color="#888888"
                />
              </View>
              <Text style={styles.userName}>Mr. Chef</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>4.2</Text>
              <IconSymbol name="star.fill" size={16} color="#FFCC00" />
            </View>
          </View>

          {/* Post Image */}
          <Image
            source={require("@/assets/images/placeholder-food.jpg")}
            style={styles.postImage}
            contentFit="cover"
          />

          {/* Post Content */}
          <View style={styles.postContent}>
            <Text style={styles.postTitle}>Kajjecaw</Text>
            <Text style={styles.postDescription}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut at
              hendrerit enim. Etiam lacinia mi nec nunc ornare, vitae tempus leo
              aliquet...
            </Text>
          </View>

          {/* Post Actions */}
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol
                name="arrowshape.turn.up.left.fill"
                size={16}
                color="#888888"
              />
              <Text style={styles.actionText}>3</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol name="text.bubble.fill" size={16} color="#888888" />
              <Text style={styles.actionText}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol name="heart.fill" size={16} color="#888888" />
              <Text style={styles.actionText}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol name="bookmark.fill" size={16} color="#888888" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#333333",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: "#FFCC00",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  categoryText: {
    fontWeight: "bold",
    color: "#333333",
  },
  filterContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  filterText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginRight: 4,
  },
  postContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  userInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  userName: {
    marginLeft: 8,
    fontWeight: "bold",
    color: "#333333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginRight: 4,
    fontWeight: "bold",
    color: "#333333",
  },
  postImage: {
    width: "100%",
    height: 200,
  },
  postContent: {
    padding: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333333",
  },
  postDescription: {
    color: "#666666",
    fontSize: 14,
  },
  postActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionText: {
    marginLeft: 4,
    color: "#666666",
  },
});
