import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { apiService, School } from "../services/apiService";
import { useAuth } from "./AuthContext";

interface SchoolContextType {
  schools: School[];
  selectedSchool: School | null;
  isLoadingSchools: boolean;
  selectSchool: (school: School) => void;
  refreshSchools: () => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

interface SchoolProviderProps {
  children: ReactNode;
}

export const SchoolProvider: React.FC<SchoolProviderProps> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchSchools();
    } else {
      // Clear schools and selected school when user logs out
      setSchools([]);
      setSelectedSchool(null);
    }
  }, [isAuthenticated]);

  const fetchSchools = async () => {
    try {
      setIsLoadingSchools(true);
      console.log("Fetching schools...");
      const response = await apiService.getSchools();
      console.log("Schools response:", response);

      if (response.success && response.data.schools) {
        setSchools(response.data.schools);

        // Auto-select if only one school
        if (response.data.schools.length === 1) {
          setSelectedSchool(response.data.schools[0]);
        }
      }
    } catch (error: any) {
      console.error("Error fetching schools:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      setSchools([]);
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const selectSchool = (school: School) => {
    setSelectedSchool(school);
  };

  const refreshSchools = async () => {
    await fetchSchools();
  };

  const value: SchoolContextType = {
    schools,
    selectedSchool,
    isLoadingSchools,
    selectSchool,
    refreshSchools,
  };

  return (
    <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>
  );
};

export const useSchool = (): SchoolContextType => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error("useSchool must be used within a SchoolProvider");
  }
  return context;
};
