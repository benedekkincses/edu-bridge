import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSchool } from "./SchoolContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "../services/apiService";

export interface Channel {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberCount: number;
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

      // Fetch user's classes from API
      const response = await apiService.getUserClasses();

      if (response.success) {
        const userClasses: ClassInfo[] = response.data.classes.map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          grade: cls.type, // Using type as grade for now
          schoolId: cls.schoolId,
          schoolName: cls.schoolName,
          studentCount: cls.studentCount,
          channels: [], // Will be fetched separately
        }));

        setClasses(userClasses);

        // Try to restore previous selection or auto-select
        const savedClassId = await AsyncStorage.getItem(SELECTED_CLASS_KEY);

        if (userClasses.length === 1) {
          // Auto-select if only one class
          await selectClass(userClasses[0]);
        } else if (savedClassId) {
          // Try to restore saved class
          const savedClass = userClasses.find(c => c.id === savedClassId);
          if (savedClass) {
            await selectClass(savedClass);
          }
        }
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const selectClass = async (classInfo: ClassInfo) => {
    try {
      // Fetch channels (groups) for this class
      const response = await apiService.getClassGroups(classInfo.id);

      if (response.success) {
        const channels = response.data.groups;

        // Update the class info with fetched channels
        const updatedClass = {
          ...classInfo,
          channels,
        };

        setSelectedClass(updatedClass);

        // Auto-select first channel if available, otherwise clear selection
        const firstChannel = channels.length > 0 ? channels[0] : null;
        setSelectedChannel(firstChannel);

        // Save selection
        await AsyncStorage.setItem(SELECTED_CLASS_KEY, classInfo.id);
        if (firstChannel) {
          await AsyncStorage.setItem(SELECTED_CHANNEL_KEY, firstChannel.id);
        } else {
          await AsyncStorage.removeItem(SELECTED_CHANNEL_KEY);
        }
      } else {
        // No channels found, just select the class
        setSelectedClass(classInfo);
        setSelectedChannel(null);
        await AsyncStorage.setItem(SELECTED_CLASS_KEY, classInfo.id);
        await AsyncStorage.removeItem(SELECTED_CHANNEL_KEY);
      }
    } catch (error) {
      console.error("Error selecting class or fetching channels:", error);
      // Fallback: select class without channels
      setSelectedClass(classInfo);
      setSelectedChannel(null);
      await AsyncStorage.setItem(SELECTED_CLASS_KEY, classInfo.id);
      await AsyncStorage.removeItem(SELECTED_CHANNEL_KEY);
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
