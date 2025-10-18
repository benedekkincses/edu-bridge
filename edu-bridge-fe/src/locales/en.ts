export const en = {
  common: {
    logout: "Logout",
    loading: "Loading...",
    selectSchool: "Select School",
    noSchool: "No School",
    cancel: "Cancel",
  },
  login: {
    title: "Welcome to Edu Bridge",
    subtitle: "Your educational platform",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    loginButton: "Login",
    loggingIn: "Logging in...",
    loginError: "Login failed. Please check your credentials.",
    selectLanguage: "Language",
  },
  header: {
    selectSchool: "Select School",
  },
  footer: {
    news: "News",
    class: "Class",
    messages: "Messages",
    calendar: "Calendar",
  },
  schoolSelector: {
    title: "Select a School",
    subtitle: "Choose which school you'd like to view",
    loadingSchools: "Loading your schools...",
  },
  news: {
    title: "School News Feed",
    subtitle: "This is the News page - Coming soon!",
    testCard1Title: "Test Card 1",
    testCard1Content:
      "This page will display school news, announcements, events, and sports updates.",
    testCard2Title: "Test Card 2",
    testCard2Content:
      "Features will include filtering by category (All, Events, Announcements, Sports) and search functionality.",
    testCard3Title: "Test Card 3",
    testCard3Content:
      'Each news item will show date, title, preview text, and a "Read More" button.',
  },
  class: {
    title: "Class Page",
    subtitle: "This is the Class page - Coming soon!",
    groupChannelsTitle: "Group Channels",
    groupChannelsContent:
      "This section will display various class channels like General, Assignments, Exams, Extracurricular, and Parent-Teacher Meetings.",
    classPostsTitle: "Class Posts",
    classPostsContent:
      "Teachers can post announcements, homework reminders, and upcoming school trips with attachments.",
    channelNavigationTitle: "Channel Navigation",
    channelNavigationContent:
      "Parents can navigate between different channels to see specific content relevant to each category.",
  },
  messages: {
    title: "Messages",
    searchPlaceholder: "Search conversations...",
    aiAssistant: "AI Assistant",
    aiAssistantStatus: "Always available",
    addContact: "Add Contact",
    findPeople: "Find People",
    searchPeople: "Search by name or email...",
    noPeopleFound: "No people found in your school",
    selectPerson: "Select a person to start chatting",
    noConversations: "No conversations yet",
    startConversation: "Start a new conversation by tapping the + button",
  },
  calendar: {
    title: "Calendar",
    subtitle: "This is the Calendar page - Coming soon!",
    calendarViewsTitle: "Calendar Views",
    calendarViewsContent:
      "Switch between Day, Week, and Month views to see school events and schedules at different levels of detail.",
    eventManagementTitle: "Event Management",
    eventManagementContent:
      "View all scheduled events, parent-teacher conferences, school holidays, field trips, and important dates.",
    addEventsTitle: "Add Events",
    addEventsContent:
      "Add personal reminders and mark important dates for your child's school activities.",
    eventIndicatorsTitle: "Event Indicators",
    eventIndicatorsContent:
      "Different colored dots on calendar dates indicate various event types (blue for regular events, red for important dates).",
  },
  noSchool: {
    title: "Not Connected to Any School",
    newsFeedMessage: "Stay updated with the latest news, announcements, and events from your school. Once you're connected to a school, all important updates will appear here.",
    classMessage: "Access your child's class information, assignments, and communicate with teachers. Connect to your school to view class channels, homework, and participate in class discussions.",
    messagesMessage: "Communicate directly with teachers, staff, and other parents. Once connected to your school, you'll be able to send and receive messages, share updates, and stay in touch with your child's education team.",
    calendarMessage: "Keep track of important school events, parent-teacher conferences, holidays, and your child's activities. Once you're connected to a school, all scheduled events will appear in your personalized calendar.",
    whatsNext: "What's Next?",
    step1: "Contact your school administrator to get added to your school",
    step2: "Once added, you'll be able to access all features",
    step3: "You'll receive notifications from teachers and school staff",
  },
  profile: {
    menuName: "Profile",
    menuEmail: "Email",
    language: "Language",
    logout: "Logout",
    title: "Profile",
    accountDetails: "Account Details",
    fullName: "Full Name",
    email: "Email",
    username: "Username",
    technicalInfo: "Technical Information",
    userId: "User ID",
    userIdDescription: "This unique identifier links you to schools and other data in our system. Share this ID with your school administrator to get connected.",
    verification: "Verification Status",
    emailVerified: "Email Verified",
    yes: "Yes",
    no: "No",
    copy: "Copy",
    copied: "Copied!",
  },
  languages: {
    en: "English",
    hu: "Magyar",
  },
};

export type TranslationKeys = typeof en;
