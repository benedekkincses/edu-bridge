import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSchool } from "./SchoolContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Channel {
  id: string;
  name: string;
  type: "news" | "general" | "assignments" | "exams" | "extracurricular" | "meetings" | "custom";
  description?: string;
  isAccessible: boolean;
}

export interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  schoolId: string;
  schoolName: string;
  studentCount?: number;
  channels: Channel[];
}

interface ClassContextType {
  classes: ClassInfo[];
  selectedClass: ClassInfo | null;
  selectedChannel: Channel | null;
  isLoadingClasses: boolean;
  selectClass: (classInfo: ClassInfo) => void;
  selectChannel: (channel: Channel) => void;
  clearClassSelection: () => Promise<void>;
  refreshClasses: () => Promise<void>;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

interface ClassProviderProps {
  children: ReactNode;
}

const SELECTED_CLASS_KEY = "@selected_class";
const SELECTED_CHANNEL_KEY = "@selected_channel";

export const ClassProvider: React.FC<ClassProviderProps> = ({ children }) => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const { selectedSchool } = useSchool();

  // Load saved class and channel selection
  useEffect(() => {
    loadSavedSelections();
  }, []);

  // Fetch classes when school changes
  useEffect(() => {
    if (selectedSchool) {
      fetchClasses();
    } else {
      setClasses([]);
      setSelectedClass(null);
      setSelectedChannel(null);
    }
  }, [selectedSchool]);

  const loadSavedSelections = async () => {
    try {
      const savedClassId = await AsyncStorage.getItem(SELECTED_CLASS_KEY);
      const savedChannelId = await AsyncStorage.getItem(SELECTED_CHANNEL_KEY);

      // These will be used after classes are loaded
      if (savedClassId && savedChannelId) {
        console.log("Found saved selections:", savedClassId, savedChannelId);
      }
    } catch (error) {
      console.error("Error loading saved selections:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      setIsLoadingClasses(true);

      // TODO: Replace with actual API call
      // const response = await apiService.getSchoolClasses(selectedSchool.id);

      // Mock data for now
      const mockClasses: ClassInfo[] = [
        {
          id: "class-1",
          name: "Class 5A",
          grade: "5th Grade",
          schoolId: selectedSchool?.id || "",
          schoolName: selectedSchool?.name || "",
          studentCount: 28,
          channels: [
            {
              id: "news-feed",
              name: "News Feed",
              type: "news",
              description: "Class announcements and updates",
              isAccessible: true,
            },
            {
              id: "general",
              name: "General",
              type: "general",
              description: "General class discussions",
              isAccessible: true,
            },
            {
              id: "assignments",
              name: "Assignments",
              type: "assignments",
              description: "Homework and assignments",
              isAccessible: true,
            },
            {
              id: "exams",
              name: "Exams",
              type: "exams",
              description: "Exam schedules and results",
              isAccessible: true,
            },
            {
              id: "extracurricular",
              name: "Extracurricular",
              type: "extracurricular",
              description: "After-school activities",
              isAccessible: true,
            },
            {
              id: "meetings",
              name: "Parent-Teacher Meetings",
              type: "meetings",
              description: "Meeting schedules",
              isAccessible: true,
            },
          ],
        },
        {
          id: "class-2",
          name: "Class 5B",
          grade: "5th Grade",
          schoolId: selectedSchool?.id || "",
          schoolName: selectedSchool?.name || "",
          studentCount: 25,
          channels: [
            {
              id: "news-feed-2",
              name: "News Feed",
              type: "news",
              description: "Class announcements and updates",
              isAccessible: true,
            },
            {
              id: "general-2",
              name: "General",
              type: "general",
              description: "General class discussions",
              isAccessible: true,
            },
          ],
        },
      ];

      setClasses(mockClasses);

      // Try to restore previous selection or auto-select
      const savedClassId = await AsyncStorage.getItem(SELECTED_CLASS_KEY);
      const savedChannelId = await AsyncStorage.getItem(SELECTED_CHANNEL_KEY);

      if (mockClasses.length === 1) {
        // Auto-select if only one class
        const singleClass = mockClasses[0];
        setSelectedClass(singleClass);

        // Auto-select news feed or first channel
        const newsChannel = singleClass.channels.find(c => c.type === "news");
        const firstChannel = singleClass.channels[0];
        setSelectedChannel(newsChannel || firstChannel);
      } else if (savedClassId) {
        // Try to restore saved class
        const savedClass = mockClasses.find(c => c.id === savedClassId);
        if (savedClass) {
          setSelectedClass(savedClass);

          if (savedChannelId) {
            const savedChannel = savedClass.channels.find(c => c.id === savedChannelId);
            if (savedChannel) {
              setSelectedChannel(savedChannel);
            } else {
              // Default to news feed
              const newsChannel = savedClass.channels.find(c => c.type === "news");
              setSelectedChannel(newsChannel || savedClass.channels[0]);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const selectClass = async (classInfo: ClassInfo) => {
    setSelectedClass(classInfo);

    // Auto-select news feed or first channel
    const newsChannel = classInfo.channels.find(c => c.type === "news");
    const firstChannel = classInfo.channels[0];
    const channelToSelect = newsChannel || firstChannel;

    setSelectedChannel(channelToSelect);

    // Save selection
    try {
      await AsyncStorage.setItem(SELECTED_CLASS_KEY, classInfo.id);
      if (channelToSelect) {
        await AsyncStorage.setItem(SELECTED_CHANNEL_KEY, channelToSelect.id);
      }
    } catch (error) {
      console.error("Error saving class selection:", error);
    }
  };

  const selectChannel = async (channel: Channel) => {
    setSelectedChannel(channel);

    // Save selection
    try {
      await AsyncStorage.setItem(SELECTED_CHANNEL_KEY, channel.id);
    } catch (error) {
      console.error("Error saving channel selection:", error);
    }
  };

  const clearClassSelection = async () => {
    setSelectedClass(null);
    setSelectedChannel(null);

    // Clear from storage
    try {
      await AsyncStorage.removeItem(SELECTED_CLASS_KEY);
      await AsyncStorage.removeItem(SELECTED_CHANNEL_KEY);
    } catch (error) {
      console.error("Error clearing class selection:", error);
    }
  };

  const refreshClasses = async () => {
    await fetchClasses();
  };

  const value: ClassContextType = {
    classes,
    selectedClass,
    selectedChannel,
    isLoadingClasses,
    selectClass,
    selectChannel,
    clearClassSelection,
    refreshClasses,
  };

  return (
    <ClassContext.Provider value={value}>{children}</ClassContext.Provider>
  );
};

export const useClass = (): ClassContextType => {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error("useClass must be used within a ClassProvider");
  }
  return context;
};
