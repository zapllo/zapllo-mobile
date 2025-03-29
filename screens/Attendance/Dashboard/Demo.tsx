"use client";

import React, { useState, useEffect } from "react";
import Loader from "@/components/ui/loader";
import Webcam from "react-webcam";
// import CustomTimePicker from "./CustomTimePicker";
// Adjust the path to where CustomTimePicker is located
import { Separator } from "@/components/ui/separator";
import CustomTimePicker from "@/components/globals/time-picker";
import {
  BookIcon,
  Building,
  Calendar,
  CalendarClock,
  Camera,
  CheckCircle,
  Clock,
  Globe,
  MapPin,
  MapPinIcon,
  Users2,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
} from "@/components/ui/dialog";

// Remove the top-level import of Leaflet
// import L from 'leaflet';

// Import Leaflet CSS (this is okay because CSS imports don't execute JS code)
import { toast, Toaster } from "sonner";
import RegularizationDetails from "@/components/sheets/regularizationDetails";
import CustomDatePicker from "@/components/globals/date-picker";
import { Button } from "@/components/ui/button";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { format, parseISO } from "date-fns";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import axios from "axios";
import { FaHouseUser } from "react-icons/fa";
import { Tabs3, TabsList3, TabsTrigger3 } from "@/components/ui/tabs3";
import Cookies from 'js-cookie';

const mapContainerStyle = {
  height: "400px",
  width: "100%",
};

// Define interface for login entries
interface LoginEntry {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    reportingManager: {
      firstName: string;
      lastName: string;
    };
  };
  lat: number;
  lng: number;
  timestamp: string;
  action: "login" | "logout" | "regularization" | "break_started" | "break_ended";
  approvalStatus?: "Pending" | "Approved" | "Rejected"; // Add the approvalStatus field
  loginTime: string;
  logoutTime: string;
  remarks: string;
  notes?: string;
}

// Helper function to group entries by day
const groupEntriesByDay = (
  entries: LoginEntry[] | undefined | null
): { [date: string]: LoginEntry[] } => {
  if (!entries || entries.length === 0) {
    return {}; // Return an empty object if entries are undefined, null, or empty
  }

  return entries.reduce((acc: { [date: string]: LoginEntry[] }, entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString(); // Group by date
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {});
};

export default function MyAttendance() {
  const [loginEntries, setLoginEntries] = useState<LoginEntry[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isBreakOpen, setIsBreakOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("thisMonth"); // Set default to 'thisMonth'
  const [activeAttendanceTab, setActiveAttendanceTab] = useState("dailyReport");
  const [customDateRange, setCustomDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Login Time

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  // const [regularizationLoginTime, setRegularizationLoginTime] = useState<
  //   string | null
  // >(null);

  const handleTimeChange = (time: string) => {
    setRegularizationLoginTime(time);
  };

  const openTimePicker = () => {
    setIsTimePickerOpen(true); // Open the time picker
  };

  const handleCancel = () => {
    setIsTimePickerOpen(false); // Close the time picker without changes
  };

  const handleAccept = () => {
    setIsTimePickerOpen(false); // Close the time picker after selecting time
  };

  // Logout picker

  const [isLogoutTimePickerOpen, setIsLogoutTimePickerOpen] = useState(false);
  // const [regularizationLogoutTime, setRegularizationLogoutTime] = useState<
  //   string | null
  // >(null);

  const handleLogoutTimeChange = (time: string) => {
    setRegularizationLogoutTime(time);
  };

  // Formatting the time for display
  const formatTimeForDisplay = (time: string | null): string => {
    if (!time) return '';
    return format(new Date(`1970-01-01T${time}:00`), 'hh:mm a'); // Convert to 12-hour format
  };

  const openLogoutTimePicker = () => {
    setIsLogoutTimePickerOpen(true); // Open the time picker for logout
  };

  const handleLogoutCancel = () => {
    setIsLogoutTimePickerOpen(false); // Close the time picker without changes
  };

  const handleLogoutAccept = () => {
    setIsLogoutTimePickerOpen(false); // Close the time picker after selecting time
  };

  // For Face Login Modal
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBreakImage, setCapturedBreakImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const webcamRef = React.useRef<Webcam>(null);
  // State variables for Regularization Modal
  const [isRegularizationModalOpen, setIsRegularizationModalOpen] =
    useState(false);
  const [regularizationDate, setRegularizationDate] = useState("");
  const [regularizationLoginTime, setRegularizationLoginTime] = useState("");
  const [regularizationLogoutTime, setRegularizationLogoutTime] = useState("");
  const [regularizationRemarks, setRegularizationRemarks] = useState("");
  const [isSubmittingRegularization, setIsSubmittingRegularization] =
    useState(false);
  const [hasRegisteredFaces, setHasRegisteredFaces] = useState(false);
  const [isRegisterFaceModalOpen, setIsRegisterFaceModalOpen] = useState(false); // Modal for Registering Faces
  const [selectedImages, setSelectedImages] = useState<File[]>([]); // For image selection
  const [expandedDays, setExpandedDays] = useState<{ [date: string]: boolean }>(
    {}
  );
  // Just below your other states, e.g.:
  const [isWorkFromHome, setIsWorkFromHome] = useState(false);

  const [displayLoader, setDisplayLoader] = useState(false);
  const [isDateSelected, setIsDateSelected] = useState<boolean>(false); // Track whether the user manually selects a date
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false); // For triggering the start date picker
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false); // For triggering the end date picker
  const [user, setUser] = useState<any>(null);


  const [mapCoords, setMapCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [orgData, setOrgData] = useState<{
    location: { lat: number; lng: number };
    allowGeofencing: boolean;
    geofenceRadius: number;
  } | null>(null);



  const handleViewMap = (lat: number, lng: number) => {
    setMapCoords({ lat, lng });
    setMapModalOpen(true);
  };


  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const res = await axios.get("/api/users/me");
        setUser(res.data.data); // Suppose 'res.data.data' includes 'workFromHomeAllowed'
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    getUserDetails();
  }, []);

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const res = await axios.get("/api/organization/getById");
        setOrgData(res.data.data);
      } catch (error) {
        console.error("Error fetching organization data", error);
      }
    };
    fetchOrgData();
  }, []);


  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth’s radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  console.log(isBreakOpen, 'isBreakOpen?')

  useEffect(() => {
    const fetchLoginStatus = async () => {
      try {
        setDisplayLoader(true);
        const res = await fetch("/api/check-login-status");
        const data = await res.json();

        if (data.success) {
          setIsLoggedIn(data.isLoggedIn);
          setIsBreakOpen(data.isBreakOpen);

          setHasRegisteredFaces(data.hasRegisteredFaces);
        } else {
          alert(data.error || "Failed to fetch login status.");
        }
      } catch (error) {
        console.error("Error fetching login status:", error);
      } finally {
        setDisplayLoader(false);
      }
    };

    fetchLoginStatus();
  }, [isLoggedIn, isBreakOpen]);

  useEffect(() => {
    const fetchLoginEntriesAndStatus = async () => {
      try {
        setDisplayLoader(true);
        // Fetch login entries
        const resEntries = await fetch("/api/loginEntries");
        const dataEntries = await resEntries.json();
        setLoginEntries(dataEntries.entries);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setDisplayLoader(false);
      }
    };

    fetchLoginEntriesAndStatus();
  }, [isLoggedIn, isBreakOpen]);

  const handleFaceRegistrationSubmit = async () => {
    if (selectedImages?.length !== 3) {
      toast.info("Please upload exactly 3 images.");
      return;
    }

    try {
      // Upload the images first
      setIsLoading(true);
      const formData = new FormData();
      selectedImages.forEach((file) => formData.append("files", file));

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error("Image upload failed.");
      }

      // Send a request to save the face registration request with pending status
      const faceRegistrationResponse = await fetch(
        "/api/face-registration-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrls: uploadData.fileUrls, // URLs from the image upload
          }),
        }
      );

      const faceRegistrationData = await faceRegistrationResponse.json();
      if (faceRegistrationResponse.ok && faceRegistrationData.success) {
        setIsLoading(false);
        toast.success(
          "Face registration request submitted successfully and is pending approval."
        );
        setIsRegisterFaceModalOpen(false);
        setSelectedImages([]); // Reset images
      } else {
        throw new Error("Face registration request submission failed.");
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Open modal for face login
  const handleLoginLogout = () => {
    setIsModalOpen(true);
    setCapturedImage(null);
    // setLocation(null);
    setIsModalOpen(true);
  };

  const handleBreaks = () => {
    setIsBreakModalOpen(true);
    setCapturedBreakImage(null);
    // setLocation(null);

  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const selectedFiles = Array.from(files);
      setSelectedImages(selectedFiles.slice(0, 3)); // Limit to 3 images
    }
  };

  // Utility function to convert base64 to Blob
  const dataURLtoBlob = (dataurl: string, filename: string) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([new Blob([u8arr], { type: mime })], filename);
  };

  // Helper functions to filter entries by date range
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isWithinDateRange = (date: Date, startDate: Date, endDate: Date) => {
    return date >= startDate && date <= endDate;
  };

  const isWithinLastNDays = (date: Date, days: number) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);
    return date >= pastDate && date <= today;
  };

  const filterLastTwoDaysEntries = () => {
    const today = new Date();

    return loginEntries?.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate <= today && entryDate >= today;
    });
  };

  // Filter entries based on active tab

  const filterEntriesByTab = () => {
    const today = new Date();
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const normalizeDate = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const todayNormalized = normalizeDate(today);

    switch (activeTab) {
      case "today":
        return loginEntries?.filter((entry) => {
          const entryDate = normalizeDate(new Date(entry.timestamp));
          return entryDate.getTime() === todayNormalized.getTime();
        });
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayNormalized = normalizeDate(yesterday);
        return loginEntries?.filter((entry) => {
          const entryDate = normalizeDate(new Date(entry.timestamp));
          return entryDate.getTime() === yesterdayNormalized.getTime();
        });
      case "thisWeek":
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        return loginEntries?.filter((entry) => {
          const entryDate = normalizeDate(new Date(entry.timestamp));
          return (
            entryDate >= normalizeDate(thisWeekStart) &&
            entryDate <= todayNormalized
          );
        });
      case "lastWeek":
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        return loginEntries?.filter((entry) => {
          const entryDate = normalizeDate(new Date(entry.timestamp));
          return (
            entryDate >= normalizeDate(lastWeekStart) &&
            entryDate <= normalizeDate(lastWeekEnd)
          );
        });
      case "thisMonth":
        return loginEntries?.filter((entry) => {
          const entryDate = normalizeDate(new Date(entry.timestamp));
          return (
            entryDate >= normalizeDate(thisMonthStart) &&
            entryDate <= todayNormalized
          );
        });
      case "lastMonth":
        return loginEntries?.filter((entry) => {
          const entryDate = normalizeDate(new Date(entry.timestamp));
          return (
            entryDate >= normalizeDate(lastMonthStart) &&
            entryDate <= normalizeDate(lastMonthEnd)
          );
        });
      case "allTime":
        return loginEntries;
      case "custom":
        if (customDateRange.start && customDateRange.end) {
          const startNormalized = normalizeDate(customDateRange.start);
          const endNormalized = normalizeDate(customDateRange.end);
          return loginEntries?.filter((entry) => {
            const entryDate = normalizeDate(new Date(entry.timestamp));
            return entryDate >= startNormalized && entryDate <= endNormalized;
          });
        } else {
          return loginEntries;
        }
      default:
        return loginEntries;
    }
  };

  const filteredEntries = filterEntriesByTab();

  // Open custom date range modal
  const openCustomModal = () => {
    setIsCustomModalOpen(true);
  };

  // Handle custom date range submit
  const handleCustomDateSubmit = (start: Date, end: Date) => {
    setCustomDateRange({ start, end });
    setIsCustomModalOpen(false);
    setActiveTab("custom");
  };

  const handleClose = () => {
    // Reset date range when closing
    setCustomDateRange({ start: null, end: null });
    setIsCustomModalOpen(false);
  };

  // Handle Regularization Form Submission
  const handleSubmitRegularization = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !regularizationDate ||
      !regularizationLoginTime ||
      !regularizationLogoutTime ||
      !regularizationRemarks
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmittingRegularization(true);

    try {
      setAttendanceLoading(true);
      const response = await fetch("/api/regularize", {
        method: "POST",
        body: JSON.stringify({
          date: regularizationDate,
          loginTime: regularizationLoginTime,
          logoutTime: regularizationLogoutTime,
          remarks: regularizationRemarks,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast(<div className=" w-full mb-6 gap-2 m-auto  ">
          <div className="w-full flex  justify-center">
            <DotLottieReact
              src="/lottie/tick.lottie"
              loop
              autoplay
            />
          </div>
          <h1 className="text-black text-center font-medium text-lg">Regularization request submitted successfully</h1>
        </div>);
        // Refresh login entries
        const resEntries = await fetch("/api/loginEntries", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const dataEntries = await resEntries.json();
        setLoginEntries(dataEntries.entries);
        setAttendanceLoading(false);

        // Reset form fields
        setRegularizationDate("");
        setRegularizationLoginTime("");
        setRegularizationLogoutTime("");
        setRegularizationRemarks("");
        setIsRegularizationModalOpen(false);
      } else {
        throw new Error(
          data.message || "Failed to submit regularization request."
        );
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmittingRegularization(false);
    }
  };

  console.log(loginEntries, "login entries");

  const handleRegisterFaces = () => {
    setIsRegisterFaceModalOpen(true);
  };


  const fetchLocation = () => {
    // Try to retrieve the stored location from cookies
    const stored = Cookies.get('userLocation');
    if (stored) {
      try {
        const { location: savedLocation, timestamp } = JSON.parse(stored);
        const oneHour = 3600 * 1000; // in milliseconds
        if (Date.now() - timestamp < oneHour) {
          // Use the stored location if it is less than an hour old
          setLocation(savedLocation);
          console.log("Using stored location:", savedLocation);
          return;
        } else {
          // Remove outdated cookie
          Cookies.remove('userLocation');
        }
      } catch (error) {
        console.error("Error parsing stored location:", error);
        Cookies.remove('userLocation');
      }
    }

    // If no valid cookie, fetch a new location
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(loc);
        console.log("Fetched new location:", loc);
        // Save the location with a timestamp in a cookie that expires in 1 hour
        // Save the location with a timestamp in a cookie that expires in 1 hour
        Cookies.set('userLocation', JSON.stringify({ location: loc, timestamp: Date.now() }), { expires: 1 / 24 });
      },
      (error) => {
        console.error("Error fetching location:", error);
        toast.error("Unable to fetch location. Please allow location access.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  };

  // Call fetchLocation on component mount or when needed.
  // For example, you can call it inside a useEffect:
  React.useEffect(() => {
    fetchLocation();
  }, []);


  const handleModalChange = (isOpen: boolean) => {
    if (isOpen) {
      fetchLocation();
      setCapturedImage(null);
      console.log("Modal open - location:", location);
    } else {
      setCapturedImage(null);
    }
    setIsModalOpen(isOpen);
  };

  const handleBreakModalChange = (isOpen: boolean) => {
    if (isOpen) {
      fetchLocation();
      setCapturedBreakImage(null);
      console.log("Break modal open - location:", location);
    } else {
      setCapturedBreakImage(null);
    }
    setIsBreakModalOpen(isOpen);
  };

  console.log(location, 'loc bitch!')
  // When the user clicks "Take a Break"
  const captureImageAndSubmitBreakStart = async () => {
    // Capture image
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedBreakImage(imageSrc);
    }
    if (!imageSrc || !location) {
      toast.error("Please capture an image and ensure location is available.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("files", dataURLtoBlob(imageSrc, "captured_image.jpg"));

      const uploadResponse = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.fileUrls[0];

      if (!uploadResponse.ok) {
        throw new Error("Image upload failed.");
      }

      // Determine the action based on login state
      const action = isBreakOpen ? "break_ended" : "break_started";

      const loginResponse = await fetch("/api/face-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          lat: location.lat,
          lng: location.lng,
          action,
        }),
      });

      const loginData = await loginResponse.json();
      if (loginResponse.ok && loginData.success) {
        // Show appropriate toast message based on the action performed.
        if (action === "break_started") {
          toast.success("Break Started.");
        } else if (action === "break_ended") {
          toast.success("Break Ended.");
        }
        // Close the break modal after success.
        setIsBreakModalOpen(false);
        if (action === "break_started") {
          setIsBreakOpen(true);
        } else {
          setIsBreakOpen(false);
        }
      } else {
        if (action === "break_started") {
          toast.error(loginData.error || "Break start failed.");
        } else {
          toast.error(loginData.error || "Break end failed.");
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const captureImageAndSubmitLogin = async () => {
    // Capture image
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }

    if (!imageSrc || !location) {
      toast.error("Please capture an image and ensure location is available.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("files", dataURLtoBlob(imageSrc, "captured_image.jpg"));

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.fileUrls[0];

      if (!uploadResponse.ok) {
        throw new Error("Image upload failed.");
      }

      // Determine the action based on login state
      const action = isLoggedIn ? "logout" : "login";

      const loginResponse = await fetch("/api/face-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          lat: location.lat,
          lng: location.lng,
          action,
          workFromHome: isWorkFromHome,  // <-- Pass it here
        }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok && loginData.success) {
        toast.success(`${action === "login" ? "Login" : "Logout"} successful.`);
        setIsLoggedIn(action === "login");
        setIsModalOpen(false); // Close the modal on successful login/logout
      } else {
        // Check for geofencing error message
        if (loginData.error === "You are outside the allowed geofencing area.") {
          toast(<div className=" w-full mb-6 gap-2 m-auto  ">
            <div className="w-full flex  justify-center">
              <DotLottieReact
                src="/lottie/error.lottie"
                loop
                autoplay
              />
            </div>
            <h1 className="text-black text-center font-medium text-lg">You are outside the allowed<br /> Geo-Fencing Area</h1>
            <p className="text-sm text-center text-black font-medium">Please raise a regularization request</p>
          </div>);
        } else if (loginData.error === "No matching face found. Please ensure you are facing the camera clearly and retry.") {
          toast.error("Face not recognized. Please try again or contact support.");
        } else {
          throw new Error(loginData.error || "Face recognition failed.");
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };



  const filterDailyReportEntries = (entries: LoginEntry[]) => {
    return entries?.filter((entry) => {
      if (
        entry.action === "regularization" &&
        entry.approvalStatus !== "Approved"
      ) {
        return false;
      }
      return true;
    });
  };

  const filterRegularizationEntries = (entries: LoginEntry[]) => {
    return entries?.filter((entry) => entry.action === "regularization");
  };

  function formatTimeToAMPM(timeString: string | undefined): string {
    if (!timeString) {
      return ""; // Return an empty string or a placeholder if timeString is undefined
    }



    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const [selectedRegularization, setSelectedRegularization] =
    useState<LoginEntry | null>(null);

  const handleRegularizationClick = (regularization: LoginEntry) => {
    setSelectedRegularization(regularization);
  };

  const handleSheetClose = () => {
    setSelectedRegularization(null);
  };

  console.log(selectedRegularization, 'reg')

  const renderRegularizationEntries = () => {
    const regularizationEntries = filterRegularizationEntries(filteredEntries);
    console.log(regularizationEntries, ' entries check');

    return (
      <>
        {regularizationEntries?.length === 0 ? (
          <div className='flex  justify-center w-full'>
            <div className=' w-full mt-4  justify-center '>
              <div className='flex justify-center'>
                <DotLottieReact
                  src="/lottie/empty.lottie"
                  loop
                  className="h-56"
                  autoplay
                />
              </div>
              <div className='text-center w-full'>

                <h1 className=' text-lg font-semibold text-'>No Entries Found</h1>
                <p className='text-sm p-2 '>It seems like you have not raised any requests yet</p>
              </div>
            </div>

          </div>
        ) : (
          <ul className="space-y-4">
            {regularizationEntries.map((entry, index) => (
              <li
                key={index}
                onClick={() => handleRegularizationClick(entry)}
                className="flex cursor-pointer border text-xs justify-between items-center px-4 py-2 rounded shadow-md"
              >
                {entry.userId && (
                  <div className="flex gap-2 items-center justify-start">
                    <div className="h-7 w-7 rounded-full text-white bg-[#815BF5]">
                      <h1 className="text-center uppercase text-xs mt-1">
                        {entry.userId.firstName[0]}
                        {entry.userId.lastName[0]}
                      </h1>
                    </div>
                    <h1
                      id="userName"
                      className="col-span-3 text-sm"
                    >{`${entry.userId.firstName} ${entry.userId.lastName}`}</h1>
                  </div>
                )}
                <span>
                  {`Login: ${formatTimeToAMPM(
                    entry.loginTime
                  )} - Logout: ${formatTimeToAMPM(entry.logoutTime)}`}
                </span>

                {/* Display approvalStatus */}
                <span
                  className={
                    entry.approvalStatus === "Approved"
                      ? "bg-[#017a5b] px-2 py-1 rounded-xl"
                      : entry.approvalStatus === "Rejected"
                        ? "bg-red-800 rounded-xl px-2 py-1"
                        : "bg-orange-800 px-2 py-1 rounded-xl"
                  }
                >
                  {/* {`Approval Status: `} */}
                  <strong className="text-white">{entry.approvalStatus}</strong>
                </span>

                {/* If lat and lng are present, render the map icon */}
                {entry.lat && entry.lng && (
                  <button
                    onClick={() => handleViewMap(entry.lat, entry.lng)}
                    className="underline text-blue-500 ml-2"
                  >
                    <MapPin />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {selectedRegularization && (
          <RegularizationDetails
            selectedRegularization={selectedRegularization}
            onClose={handleSheetClose}
          />
        )}
      </>
    );
  };

  // Filter for Daily Report or Regularization
  const displayedEntries =
    activeAttendanceTab === "dailyReport"
      ? filterDailyReportEntries(filteredEntries) // Filtered entries passed here
      : filterRegularizationEntries(filteredEntries);

  const calculateHoursBetweenLoginLogout = (entries: LoginEntry[]): string => {
    // Sort entries by timestamp (ascending)
    const sortedEntries = entries.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let totalNetMs = 0;
    let loginTime: number | null = null;
    let totalBreakMs = 0;
    let currentBreakStart: number | null = null;

    sortedEntries.forEach((entry) => {
      const entryTime = new Date(entry.timestamp).getTime();

      if (entry.action === 'login') {
        // Start a new work session
        loginTime = entryTime;
        totalBreakMs = 0;
        currentBreakStart = null;
      } else if (entry.action === 'break_started') {
        // Mark the break start time
        currentBreakStart = entryTime;
      } else if (entry.action === 'break_ended') {
        if (currentBreakStart !== null) {
          // Add break duration
          totalBreakMs += entryTime - currentBreakStart;
          currentBreakStart = null;
        }
      } else if (entry.action === 'logout') {
        if (loginTime !== null) {
          // If a break was ongoing, add break duration until logout.
          if (currentBreakStart !== null) {
            totalBreakMs += entryTime - currentBreakStart;
            currentBreakStart = null;
          }
          const sessionDurationMs = entryTime - loginTime;
          const netSessionMs = sessionDurationMs - totalBreakMs;
          totalNetMs += netSessionMs;
          // Reset for the next session.
          loginTime = null;
          totalBreakMs = 0;
        }
      }
    });

    // If the last entry is a break_started (and there was a login), assume the session ended at the break start.
    if (loginTime !== null && currentBreakStart !== null) {
      const sessionDurationMs = currentBreakStart - loginTime;
      const netSessionMs = sessionDurationMs - totalBreakMs;
      totalNetMs += netSessionMs;
    }

    // Convert totalNetMs to hours and minutes
    const hours = Math.floor(totalNetMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalNetMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };






  // Define state variables for counts and hours
  const [daysCount, setDaysCount] = useState(0);
  const [regularizedCount, setRegularizedCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  // Calculate counts and hours based on filtered entries
  useEffect(() => {
    const dailyReportEntries = filterDailyReportEntries(filteredEntries);

    const uniqueDays = new Set(
      dailyReportEntries?.map((entry) => new Date(entry.timestamp).toLocaleDateString())
    );

    const totalRegularized = dailyReportEntries?.filter(
      (entry) => entry.action === "regularization"
    ).length;

    const verifiedRegularized = dailyReportEntries?.filter(
      (entry) => entry.approvalStatus === "Approved"
    ).length;

    let totalHoursAcc = 0;
    uniqueDays.forEach((day) => {
      const entriesForDay = dailyReportEntries?.filter(
        (entry) => new Date(entry.timestamp).toLocaleDateString() === day
      );

      // Calculate total hours including regularization
      totalHoursAcc += parseFloat(calculateHoursBetweenLoginLogout(entriesForDay));
    });

    // Ensure this section handles regularization entries if they are not included
    const regularizationEntriesForDay = dailyReportEntries?.filter(
      (entry) => entry.action === "regularization"
    );

    if (regularizationEntriesForDay.length > 0) {
      totalHoursAcc += parseFloat(calculateHoursBetweenLoginLogout(regularizationEntriesForDay));
    }

    setDaysCount(uniqueDays.size);
    setRegularizedCount(totalRegularized);
    setVerifiedCount(verifiedRegularized);
    setTotalHours(Number(totalHoursAcc.toFixed(2))); // Ensure that you're passing a number
  }, [filteredEntries, activeAttendanceTab]);

  const isToday = (someDate: Date) => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  };

  // Filter function to get today's login entries

  const filterTodayEntries = (entries: LoginEntry[]) => {
    return entries?.filter((entry) => {
      // Exclude regularization entries and only include login and logout actions
      return (
        isToday(new Date(entry.timestamp)) &&
        (
          entry.action === "login" ||
          entry.action === "logout" ||
          entry.action === "break_started" ||
          entry.action === "break_ended"
        )
      );
    });
  };

  const todayEntries = filterTodayEntries(loginEntries);

  // Handle accordion toggling
  const toggleDayExpansion = (date: string) => {
    setExpandedDays((prevState) => ({
      ...prevState,
      [date]: !prevState[date],
    }));
  };

  // const groupedEntries = groupEntriesByDay(filteredEntries);

  // Filter approved entries and group them by day
  const filterApprovedEntries = (entries: LoginEntry[]) => {
    return entries?.filter((entry) => {
      if (
        entry.action === "regularization" &&
        entry.approvalStatus !== "Approved"
      ) {
        return false;
      }
      return true;
    });
  };

  // Grouped entries by day
  const groupedEntries = groupEntriesByDay(
    filterApprovedEntries(filteredEntries)
  );




  console.log(todayEntries, 'todays');
  return (
    <div className="container m h-full overflow-y-scroll scrollbar-hide rounded-lg p-4 dark:shadow-lg">
      {/* <Toaster /> */}
      {displayLoader && (
        <div className="absolute  w-screen h-screen  z-[100]  inset-0 bg-white dark:bg-[#04061e] -900  bg-opacity-90 rounded-xl flex justify-center items-center">
          {/* <Toaster /> */}
          <div className=" z-[100]  max-h-screen max-w-screen text-[#D0D3D3] w-[100%] rounded-lg ">
            <div className="">
              <div className="absolute z-50 inset-0 flex flex-col items-center justify-center dark:text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl">
                <img src="/logo/loader.png" className="h-[15%] animate-pulse" />
                <p className="bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b text-sm from-white/80 to-white/20">
                  Loading...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {attendanceLoading && (
        <div className="absolute  w-screen h-screen  z-[100] bg-white  inset-0 dark:bg-[#04061e] -900  bg-opacity-90 rounded-xl flex justify-center items-center">

          <div className=" z-[100]  max-h-screen max-w-screen text-[#D0D3D3] w-[100%] rounded-lg ">
            <div className="">
              <div className="absolute z-50 inset-0 flex flex-col items-center justify-center dark:text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl">
                <img src="/logo/loader.png" className="h-[15%] animate-pulse" />
                <p className="bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b text-sm from-white/80 to-white/20">
                  Loading...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="login-section   flex justify-center ">
        <div className="flex justify-center m-auto mt-4">
          {hasRegisteredFaces ? (
            <div>
              {isLoggedIn ? (
                <div className="flex gap-2">
                  {isBreakOpen ? (
                    <button
                      onClick={() => handleBreaks()}
                      className="bg-[#FD8928] text-white py-2 px-4 rounded text-sm"
                    >
                      End Break
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBreaks()}
                      className="bg-yellow-500 text-white py-2 px-4 rounded text-sm"
                    >
                      Take a Break
                    </button>
                  )}
                  <button
                    onClick={() => handleLoginLogout()}
                    className="bg-red-800 text-white py-2 px-4 rounded text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleLoginLogout}
                    className="bg-[#017a5b] text-white py-2 px-4 rounded text-sm"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <button
                onClick={() => setIsRegisterFaceModalOpen(true)}
                className="bg-[#815BF5] text-white py-2 px-6 rounded text-xs"
              >
                Register Faces
              </button>
            </div>
          )}

        </div>

      </div>
      {/* Login/Logout Button */}
      {/* <div className="login-section flex justify-center mb-6">
                <button
                    onClick={handleLoginLogout}
                    className={`bg-${isLoggedIn ? 'red' : 'green'}-500 text-white py-2 px-6 rounded-lg font-semibold`}
                >
                    {isLoggedIn ? 'Logout' : 'Login'}
                </button>
            </div> */}
      {/* Apply Regularization Button */}

      <div className="last-two-days-entries p-4 w-full justify-center flex mb-6">
        {todayEntries?.length === 0 ? (
          <div className="bg-[#] border w-1/2 rounded p-4">
            <div className="flex w-full justify-center">
              <img src="/animations/not found.gif" className="h-40 " />
            </div>
            <h1 className="text-center text-sm">No Entries found for today!</h1>
            <p className="text-center text-[9px]">
              Click on Login to log your attendance
            </p>
          </div>
        ) : (
          <div className="space-y-4 dark:bg-[#0B0D29] border bg-white shadow-sm   rounded p-4 w-[60%] mx-12">
            {todayEntries?.map((entry: LoginEntry, index: number) => {
              // Format login and logout times to 01:00 PM format
              const formattedLoginTime = entry.loginTime
                ? new Date(entry.loginTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
                : null;

              const formattedLogoutTime = entry.logoutTime
                ? new Date(entry.logoutTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
                : null;

              // For break events, always use the entry timestamp.
              const formattedBreakTime = new Date(entry.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });


              return (
                <div key={index} className="w-full grid grid-cols-3">
                  {entry.loginTime && (
                    <div>
                      <h1 className="text-xs py-1">Login: {formattedLoginTime}</h1>
                    </div>
                  )}
                  {entry.logoutTime && (
                    <div>
                      <h2 className="text-xs py-1">Logout: {formattedLogoutTime}</h2>
                    </div>
                  )}
                  {(entry.action === "break_started" || entry.action === "break_ended") && (
                    <div>
                      <h1 className="text-xs py-1">
                        {entry.action === "break_started"
                          ? "Break start time:"
                          : "Break end time:"}{" "}
                        {formattedBreakTime}
                      </h1>
                    </div>
                  )}
                  <div
                    className={`px-2 py-1 h-7 w-fit flex items-center justify-center text-xs border rounded-xl text-white ${entry.action === "login"
                      ? "bg-green-800"
                      : entry.action === "logout"
                        ? "bg-red-800"
                        : entry.action === "break_started"
                          ? "bg-yellow-700"
                          : entry.action === "break_ended"
                            ? "bg-[#Fd8928]"
                            : "bg-[#8A3D17]"
                      }`}
                  >
                    <h1 className="text-xs">
                      {entry.action === "login" || entry.action === "logout"
                        ? entry.action.toUpperCase()
                        : entry.action === "break_started"
                          ? "Break Started"
                          : "Break Ended"}
                    </h1>
                  </div>

                  {entry.lat && entry.lng && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleViewMap(entry.lat, entry.lng)}
                        className="underline dark:text-white h-5"
                      >
                        <MapPin />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        )}
      </div>

      <div className="apply-regularization-section flex justify-center mb-6">
        <button
          onClick={() => setIsRegularizationModalOpen(true)}
          className="bg-[#017A5B] text-white py-2 px-4 rounded text-xs"
        >
          Apply Regularization
        </button>
      </div>
      {/* Tabs for filtering entries */}
      <div className="tabs mb-6 flex flex-wrap justify-center space-x-2">
        <button
          onClick={() => setActiveTab("today")}
          className={`px-4 h-fit py-2 text-xs rounded ${activeTab === "today" ? "bg-[#815BF5] text-white" : "bg-[#] border "
            }`}
        >
          Today
        </button>
        <button
          onClick={() => setActiveTab("yesterday")}
          className={`px-4 h-fit py-2 text-xs rounded ${activeTab === "yesterday" ? "bg-[#815BF5] text-white" : "bg-[#] border"
            }`}
        >
          Yesterday
        </button>
        <button
          onClick={() => setActiveTab("thisWeek")}
          className={`px-4 py-2 h-fit text-xs rounded ${activeTab === "thisWeek" ? "bg-[#815BF5] text-white" : "bg-[#] border"
            }`}
        >
          This Week
        </button>
        <button
          onClick={() => setActiveTab("lastWeek")}
          className={`px-4 py-2 text-xs h-fit rounded ${activeTab === "lastWeek" ? "bg-[#815BF5] text-white" : "bg-[#] border"
            }`}
        >
          Last Week
        </button>
        <button
          onClick={() => setActiveTab("thisMonth")}
          className={`px-4 py-2 text-xs h-fit rounded ${activeTab === "thisMonth" ? "bg-[#815BF5] text-white" : "bg-[#] border"
            }`}
        >
          This Month
        </button>
        <button
          onClick={() => setActiveTab("lastMonth")}
          className={`px-4 py-2 text-xs h-fit rounded ${activeTab === "lastMonth" ? "bg-[#815BF5] text-white" : "bg-[#] border"
            }`}
        >
          Last Month
        </button>
        <button
          onClick={() => setActiveTab("allTime")}
          className={`px-4 py-2 text-xs h-fit rounded ${activeTab === "allTime" ? "bg-[#815BF5] text-white" : "bg-[#] border"
            }`}
        >
          All Time
        </button>
        <button
          onClick={openCustomModal}
          className={`px-4 py-2 rounded bg-[#37384B] text-xs border ${customDateRange.start && customDateRange.end
            ? "bg-[#815BF5] text-white"
            : "bg-transparent"
            }`}
        >
          Custom
        </button>
      </div>
      <div className="flex items-center justify-center gap-4 mt-2 mb-6">
        <button
          onClick={() => setActiveAttendanceTab("dailyReport")}
          className={`px-4 flex items-center gap-2 py-2 text-xs rounded ${activeAttendanceTab === "dailyReport"
            ? "bg-[#815BF5] text-white"
            : "dark:bg-[#37384B] border"
            }`}
        >
          <img src="/icons/report.png" className="dark:invert-[100] h-4" />
          Daily Report
        </button>
        <button
          onClick={() => setActiveAttendanceTab("regularization")}
          className={`px-4 flex items-center gap-2 py-2 text-xs rounded ${activeAttendanceTab === "regularization"
            ? "bg-[#815BF5] text-white"
            : "dark:bg-[#37384B] border"
            }`}
        >
          <Users2 className="h-4" />
          Regularization
        </button>
      </div>

      {/* Display login/logout entries */}
      <div className="entries-list w-full mb-36">
        {activeAttendanceTab === "dailyReport" ? (
          <>
            {Object.keys(groupedEntries)?.length === 0 ? (
              <div>
                <div className="flex justify-center mb-4 gap-4">
                  <div className="text-xs flex  border px-4 py-2 ">
                    <Calendar className="h-4 text-blue-500 mt-[1px]" />
                    <h1 className="text-xs mt-[1px] ">Days: {daysCount}</h1>
                  </div>
                  <div className="text-xs flex border px-4 py-2">
                    <CheckCircle className="h-4 text-green-500 mt-[1px]" />
                    <h1 className="text-xs mt-[1px]">
                      {" "}
                      Verified: {verifiedCount}
                    </h1>
                  </div>
                  <div className="text-xs flex  border px-4 py-2">
                    <CalendarClock className="h-4 dark:text-white" />
                    <h1 className="mt-[1px]">
                      Regularized: {regularizedCount}
                    </h1>
                  </div>
                  <div className="text-xs border flex px-4 py-2">
                    <Clock className="h-4 mt-[1px] text-orange-600" />
                    <h1 className="text-xs mt-[1px]">Hours: {totalHours}</h1>
                  </div>
                </div>
                <DotLottieReact
                  src="/lottie/empty.lottie"
                  loop
                  className="h-56"
                  autoplay
                />
                <p className="text-center dark:text-white -600">
                  No Entries for the selected time frame
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-4 gap-4">
                  <div className="text-xs flex  border px-4 py-2 ">
                    <Calendar className="h-4 text-blue-500 mt-[1px]" />
                    <h1 className="text-xs mt-[1px] ">Days: {daysCount}</h1>
                  </div>
                  <div className="text-xs flex border px-4 py-2">
                    <CheckCircle className="h-4 text-green-500 mt-[1px]" />
                    <h1 className="text-xs mt-[1px]">
                      {" "}
                      Verified: {verifiedCount}
                    </h1>
                  </div>
                  <div className="text-xs flex  border px-4 py-2">
                    <CalendarClock className="h-4 dark:text-white" />
                    <h1 className="mt-[1px]">
                      Regularized: {regularizedCount}
                    </h1>
                  </div>
                  <div className="text-xs border flex px-4 py-2">
                    <Clock className="h-4 mt-[1px] text-orange-600" />
                    <h1 className="text-xs mt-[1px]">Hours: {totalHours}</h1>
                  </div>
                </div>
                {Object.keys(groupedEntries || {}).map((date, index) => (
                  <div key={index} className="mb-4  w-full">
                    <div
                      onClick={() => toggleDayExpansion(date)}
                      className="w-full grid cursor-pointer grid-cols-3 gap-2 text-xs text-left border dark:text-white px-4 py-2 rounded rounded-b-none"
                    >
                      <div className="flex gap-2">
                        <Calendar className="h-4" /> {date}
                      </div>
                      <div className="flex gap-2">
                        <Clock className="h-4" />{" "}
                        {calculateHoursBetweenLoginLogout(groupedEntries[date])}{" "}

                      </div>
                      <div className="flex justify-end">
                        <span
                          className={`transition-transform duration-300 ${expandedDays[date] ? "rotate-180" : "rotate-0"}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                    {expandedDays[date] && (
                      <div className="p-4 border rounded w-full rounded-t-none">
                        {groupedEntries[date].map((entry, index) => (
                          <div
                            key={index}
                            className="flex w-full p-2 justify-between"
                          >
                            <div>
                              <span>
                                {entry.action === "regularization"
                                  ? `Login: ${formatTimeToAMPM(entry.loginTime)}`
                                  : entry.action === "break_started"
                                    ? `Break Started` : entry.action === "break_ended"
                                      ? `Break Ended` : `${entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}: ${format(new Date(entry.timestamp), 'hh:mm a')}` // Format action timestamp
                                }
                              </span>
                              {entry.action === "regularization" && (
                                <span>
                                  Logout: {formatTimeToAMPM(entry.logoutTime)}
                                </span>
                              )}
                            </div>

                            <div className={`text-xs cursor-pointer border w-fit h-fit text-white flex gap-2 items-center  px-2 py-1  rounded-2xl ${entry.action === "login"
                              ? "bg-green-800"
                              : entry.action === "logout"
                                ? "bg-red-800"
                                : entry.action === "break_started"
                                  ? "bg-yellow-700"
                                  : entry.action === "break_ended"
                                    ? "bg-[#Fd8928]"
                                    : "bg-[#8A3D17]"
                              }`}>
                              <div className="flex items-center">
                                {entry.action === "login" || entry.action === "logout"
                                  ? entry.action.toUpperCase()
                                  : entry.action === "break_started"
                                    ? "Break Started"
                                    : "Break Ended"}
                              </div>
                              <div className="flex items-center">
                                {entry.lat && entry.lng && (
                                  <button
                                    onClick={() => handleViewMap(entry.lat, entry.lng)}
                                    className="underline text-[#ffffff]"
                                  >
                                    <MapPinIcon className="h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              </>
            )}
          </>
        ) : (
          // Render regularization entries
          renderRegularizationEntries()
        )}
      </div>

      {/* Radix UI Dialog for Face Login */}
      <Dialog open={isModalOpen} onOpenChange={handleModalChange}>
        <DialogContent className="z-[100] flex items-center justify-center ">
          <div className=" z-[100] p-6 h-full rounded-lg max-w-lg w-full relative">
            <div className="flex justify-between">
              <div className="flex gap-2  items-center ">
                <img src="/branding/AII.png" className="h-10 dark:block hidden" />
                <img src="/branding/zapllo ai.png" className="h-5 mt-2 dark:block hidden" />
                <img src="/branding/ai-light.png" className="h-9 dark:hidden block" />

              </div>
              <DialogClose className=" ">
                <CrossCircledIcon className="scale-150 -mt-1 hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]" />
              </DialogClose>
            </div>
            <Separator className="my-4" />
            <div className="w-full flex items-center mb-4 justify-between">
              <h3 className="text-sm dark:text-white text-center ">
                {isLoggedIn
                  ? `Logout at ${new Date().toLocaleTimeString()}`
                  : `Login at ${new Date().toLocaleTimeString()}`}
              </h3>
              <Tabs3
                // If `isWorkFromHome` is true, the active tab is "work-from-home", else "office"
                value={isWorkFromHome ? "work-from-home" : "office"}
                onValueChange={(val) => {
                  setIsWorkFromHome(val === "work-from-home");
                }}
              >
                <TabsList3>
                  <TabsTrigger3 value="office">Office</TabsTrigger3>
                  <TabsTrigger3
                    value="work-from-home"
                    disabled={!user?.workFromHomeAllowed}
                  >Work From Home</TabsTrigger3>
                </TabsList3>
              </Tabs3>

              {/* <Dialog.DialogClose className="">
                  <CrossCircledIcon className="scale-150 -mt-1 hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]" />
                </Dialog.DialogClose> */}
            </div>
            {/* Webcam or Captured Image Display */}
            <div className="relative w-full h-auto mb-4">
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-auto rounded-lg"
                />
              )}

              {/* Face Logging Animation (if capturedImage exists) */}
              {capturedImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Example face detection animtion */}
                  <div className="face-animation">
                    <DotLottieReact
                      src="/lottie/facescan.lottie"
                      loop
                      className="h-56"
                      autoplay
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Single Camera Button to Capture and Submit */}
            <button
              onClick={captureImageAndSubmitLogin}
              className="bg-[#017A5B] text-white py-2 px-4 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Camera className="w-6 h-6" />{" "}
              {/* Replace with an actual camera icon */}
            </button>

            {/* Display Lat and Long */}

            {/* <div className="text-center flex w-full justify-center text-xs text-white -400">
                <p className="flex gap-2 text-sm">
                  <MapPinIcon className="h-4" />
                  {location
                    ? `Lat: ${location.lat}, Long: ${location.lng}`
                    : "Fetching location..."}
                </p>
              </div> */}
            {orgData && orgData.allowGeofencing && location && (
              <div className="mt-4 text-center">
                {calculateDistance(
                  location.lat,
                  location.lng,
                  orgData.location.lat,
                  orgData.location.lng
                ) <= orgData.geofenceRadius ? (
                  <div className="flex justify-center">
                    <div className="text-white flex gap-2 items-center bg-green-500 rounded-xl w-fit px-2 py-1 text-sm ">
                      <FaHouseUser className="h-4 text-white" />
                      You are in office reach
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="text-white flex gap-2 items-center bg-red-500 rounded-xl w-fit px-2 py-1 text-sm ">
                      <FaHouseUser className="h-4 text-white" />
                      You are outside office reach
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-center flex w-full justify-center text-xs text-white -400 mt-4">
              <div className="dark:bg-[#1E2A38] rounded-lg py-2 px-4 flex items-center gap-2 border dark:shadow-lg">
                <MapPinIcon className="h-4 text-[#FC8929]" />
                <p className="text-xs dark:text-white text-black dark:font-semibold">
                  {location
                    ? `Lat: ${location.lat}, Long: ${location.lng}`
                    : "Fetching location..."}
                </p>
              </div>
            </div>

            {/* Show Loader if submitting */}
            {isLoading && <Loader />}
          </div>
        </DialogContent>
      </Dialog>
      {/* Radix UI Dialog for Face Login */}
      <Dialog open={isBreakModalOpen} onOpenChange={handleBreakModalChange}>
        <DialogContent className="z-[100] flex items-center justify-center ">
          <div className=" z-[100] p-6 rounded-lg max-w-lg w-full relative">
            <div className="flex justify-between">
              <div className="flex gap-2  items-center ">
                <img src="/branding/AII.png" className="h-10 dark:block hidden" />
                <img src="/branding/zapllo ai.png" className="h-5 mt-2 dark:block hidden" />
                <img src="/branding/ai-light.png" className="h-9 dark:hidden block" />
              </div>
              <DialogClose className=" ">
                <CrossCircledIcon className="scale-150 -mt-1 hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]" />
              </DialogClose>
            </div>
            <Separator className="my-4" />
            <div className="w-full flex mb-4 justify-between">
              <h3 className="text-sm dark:text-white text-center ">
                {isBreakOpen
                  ? `End Break at ${new Date().toLocaleTimeString()}`
                  : `Take a Break at ${new Date().toLocaleTimeString()}`}
              </h3>
              {/* <Dialog.DialogClose className="">
                  <CrossCircledIcon className="scale-150 -mt-1 hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]" />
                </Dialog.DialogClose> */}
            </div>
            {/* Webcam or Captured Image Display */}
            <div className="relative w-full h-auto mb-4">
              {capturedBreakImage ? (
                <img
                  src={capturedBreakImage}
                  alt="Captured"
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-auto rounded-lg"
                />
              )}

              {/* Face Logging Animation (if capturedImage exists) */}
              {capturedBreakImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Example face detection animtion */}
                  <div className="face-animation">
                    <DotLottieReact
                      src="/lottie/facescan.lottie"
                      loop
                      className="h-56"
                      autoplay
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Single Camera Button to Capture and Submit */}
            <button
              onClick={captureImageAndSubmitBreakStart}
              className="bg-[#017A5B] text-white py-2 px-4 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Camera className="w-6 h-6" />{" "}
              {/* Replace with an actual camera icon */}
            </button>

            {/* Display Lat and Long */}

            {/* <div className="text-center flex w-full justify-center text-xs text-white -400">
                <p className="flex gap-2 text-sm">
                  <MapPinIcon className="h-4" />
                  {location
                    ? `Lat: ${location.lat}, Long: ${location.lng}`
                    : "Fetching location..."}
                </p>
              </div> */}
            {orgData && orgData.allowGeofencing && location && (
              <div className="mt-4 text-center">
                {calculateDistance(
                  location.lat,
                  location.lng,
                  orgData.location.lat,
                  orgData.location.lng
                ) <= orgData.geofenceRadius ? (
                  <div className="flex justify-center">
                    <div className="text-white flex gap-2 items-center bg-green-500 rounded-xl w-fit px-2 py-1 text-sm ">
                      <FaHouseUser className="h-4 text-white" />
                      You are outside office reach
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="text-white flex gap-2 items-center bg-red-500 rounded-xl w-fit px-2 py-1 text-sm ">
                      <FaHouseUser className="h-4 text-white" />
                      You are outside office reach
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-center flex w-full justify-center text-xs text-white -400 mt-4">
              <div className="dark:bg-[#1E2A38] rounded-lg border py-2 px-4 flex items-center gap-2 dark:shadow-lg">
                <MapPinIcon className="h-4 text-[#FC8929]" />
                <p className="text-xs dark:text-white text-black dark:font-semibold">
                  {location
                    ? `Lat: ${location.lat}, Long: ${location.lng}`
                    : "Fetching location..."}
                </p>
              </div>
            </div>

            {/* Show Loader if submitting */}
            {isLoading && <Loader />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Map Modal */}
      <Dialog open={mapModalOpen} onOpenChange={setMapModalOpen}>
        <DialogContent className=" z-[100]">
          <div className=" p-4 overflow-y-scroll scrollbar-hide h-[500px]   shadow-lg w-full   max-w-lg  rounded-lg">
            <div className="w-full flex justify-between">
              <h1 className="py-4 flex gap-2  ">
                <Globe className="h-6 text-[#815BF5]" />
                Geo Location
              </h1>
              <DialogClose className="dark:text-white py-4 px-1  ">
                <CrossCircledIcon className="scale-150 mt-1 hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]" />
              </DialogClose>
            </div>
            <div className="">
              {mapCoords && (
                <LoadScript googleMapsApiKey="AIzaSyASY9lRvSpjIR2skVaTLd6x7M1Kx2zY-4k">
                  {" "}
                  {/* Replace with your API key */}
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCoords}
                    zoom={13}
                    options={{
                      disableDefaultUI: true, // Disable default UI if you want
                      zoomControl: true, // Show zoom control
                    }}
                  >
                    <Marker position={mapCoords} />
                  </GoogleMap>
                </LoadScript>
              )}
            </div>
            {/* {mapCoords && (
                <MapContainer
                  center={[mapCoords.lat, mapCoords.lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[mapCoords.lat, mapCoords.lng]}></Marker>
                </MapContainer>
              )} */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Date Range Modal */}
      <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
        <DialogContent className="w-96 z-[100] ml-12 p-6 ">
          <div className="flex justify-between">
            <DialogTitle className="text-md  font-medium dark:text-white">
              Select Custom Date Range
            </DialogTitle>
            <DialogClose className="" onClick={handleClose}>
              {" "}
              <CrossCircledIcon className="scale-150  hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]" />
              {/* <X className="cursor-pointer border -mt-4 rounded-full border-white h-6 hover:bg-white hover:text-black w-6" /> */}
            </DialogClose>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customDateRange.start && customDateRange.end) {
                handleCustomDateSubmit(
                  customDateRange.start,
                  customDateRange.end
                );
              }
            }}
            className="space-y-4"
          >
            <div className="flex justify-between gap-2">
              {/* Start Date Button */}
              <div className="w-full">
                {/* <h1 className="absolute bg-[#0B0D29] ml-2 text-xs font-medium text-white">
                  Start Date
                </h1> */}
                <button
                  type="button"
                  className="text-start text-xs text-gray-400 mt-2 w-full border p-2 rounded"
                  onClick={() => setIsStartPickerOpen(true)} // Open end date picker
                >
                  {customDateRange.start ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4" />

                      {new Date(customDateRange.start).toLocaleDateString(
                        "en-GB"
                      )}
                    </div>
                  ) : (
                    // Format date as dd/mm/yyyy
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4" />
                      <h1 className="text-xs">Start Date</h1>
                    </div>
                  )}
                </button>
              </div>

              {/* End Date Button */}
              <div className="w-full">
                {/* <h1 className="absolute bg-[#0B0D29] ml-2 text-xs font-medium text-white">
                  End Date
                </h1> */}
                <button
                  type="button"
                  className="text-start text-xs text-gray-400 mt-2 w-full border p-2 rounded"
                  onClick={() => setIsEndPickerOpen(true)} // Open end date picker
                >
                  {customDateRange.end ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4" />

                      {new Date(customDateRange.end).toLocaleDateString(
                        "en-GB"
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Calendar className="h-4" />
                      <h1 className="text-xs">End date</h1>
                    </div>
                  )}
                </button>
              </div>
            </div>
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="bg-[#815BF5] text-white py-2 px-4 rounded w-full text-xs"
              >
                Apply
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Start Date Picker Modal */}
      <Dialog open={isStartPickerOpen} onOpenChange={setIsStartPickerOpen}>
        <DialogContent className=" z-[100] bg-black dark:bg-[#0a0d28] scale-90 flex justify-center ">
          <div className=" z-[20] rounded-lg  scale-[80%] max-w-4xl flex justify-center items-center w-full relative">
            <div className="w-full flex mb-4 justify-between">
              <CustomDatePicker
                selectedDate={customDateRange.start}
                onDateChange={(newDate) => {
                  setCustomDateRange((prev) => ({ ...prev, start: newDate }));
                  setIsStartPickerOpen(false); // Close picker after selecting the date
                }}
                onCloseDialog={() => setIsStartPickerOpen(false)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Date Picker Modal */}
      <Dialog open={isEndPickerOpen} onOpenChange={setIsEndPickerOpen}>
        <DialogContent className=" z-[100] bg-black dark:bg-[#0a0d28]  scale-90 flex justify-center ">
          <div className=" z-[20] rounded-lg  scale-[80%] max-w-4xl flex justify-center items-center w-full relative">
            <div className="w-full flex mb-4 justify-between">
              <CustomDatePicker
                selectedDate={customDateRange.end}
                onDateChange={(newDate) => {
                  setCustomDateRange((prev) => ({ ...prev, end: newDate }));
                  setIsEndPickerOpen(false); // Close picker after selecting the date
                }}
                onCloseDialog={() => setIsEndPickerOpen(false)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/**Regularization Modal */}
      <Dialog
        open={isRegularizationModalOpen}
        onOpenChange={setIsRegularizationModalOpen}
      >

        <DialogContent className=" z-[100]  flex  w-full  ">
          <div className=" overflow-y-scroll scrollbar-hide h-fit max-h-[600px]  shadow-lg w-full   max-w-lg  rounded-lg">
            <div className="flex border-b py-2  w-full justify-between">
              <DialogTitle className="text-md  dark:text-white px-6 py-2 font-medium">
                Apply Regularization
              </DialogTitle>
              <DialogClose className="px-6 py-2">
                <CrossCircledIcon className="scale-150 mt-1 hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]" />
              </DialogClose>
            </div>

            <form
              onSubmit={handleSubmitRegularization}
              className="space-y-4 p-6"
            >
              {/* Date Input */}
              <div className="relative">
                <Dialog
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setIsDatePickerOpen(true)}
                      className="rounded border w-full  flex gap-1 py-2"
                    >
                      <Calendar className="h-4 mt-0.5 text-sm" />
                      {regularizationDate ? (
                        // Show the selected date if a date has been picked
                        <h1 className="text-xs mt-1">
                          {format(parseISO(String(regularizationDate)), "dd-MM-yyyy")}
                        </h1>
                      ) : (
                        <h1 className="text-xs mt-1  dark:bg-[#0b0d29] text-[#787CA5]">
                          Select Date
                        </h1>
                      )}
                    </button>
                  </DialogTrigger>
                  <DialogContent className=" z-[100] bg-[#0a0d28] scale-[80%]  flex justify-center ">
                    <div className=" z-[20] rounded-lg  scale-[80%] max-w-4xl flex justify-center items-center w-full relative">
                      <div className="w-full flex mb-4 justify-between">
                        <CustomDatePicker
                          selectedDate={
                            regularizationDate
                              ? new Date(regularizationDate)
                              : null
                          }
                          onDateChange={(newDate) => {
                            // Manually extract the local date (year, month, day)
                            const localDate = new Date(
                              newDate.getTime() -
                              newDate.getTimezoneOffset() * 60000
                            )
                              .toISOString()
                              .split("T")[0];
                            setRegularizationDate(localDate);
                            setIsDatePickerOpen(false); // Close the picker after selecting the date
                          }}
                          onCloseDialog={() => setIsDatePickerOpen(false)}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {/* Login Time Input */}
              <div className="relative">
                <Dialog
                  open={isTimePickerOpen}
                  onOpenChange={setIsTimePickerOpen}
                >
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="rounded border w-full  flex gap-1 py-2"
                      onClick={openTimePicker}
                    >
                      <Clock className="h-4 mt-1 text-sm" />
                      {regularizationLoginTime ? (
                        <h1 className="text-xs mt-1">
                          {formatTimeForDisplay(regularizationLoginTime)}
                        </h1>
                      ) : (
                        <h1 className="text-xs mt-1 dark:bg-[#0b0d29] text-[#787CA5]">
                          Login Time
                        </h1>
                      )}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="scale-75 bg-[#0a0d28] p-6 ">

                    <CustomTimePicker
                      selectedTime={regularizationLoginTime}
                      onTimeChange={handleTimeChange}
                      onCancel={handleCancel}
                      onAccept={handleAccept}
                      onBackToDatePicker={() =>
                        setIsTimePickerOpen(false)
                      }
                    />

                  </DialogContent>
                </Dialog>
              </div>


              {/* Logout Time Iput*/}

              <div className="relative">
                <Dialog
                  open={isLogoutTimePickerOpen}
                  onOpenChange={setIsLogoutTimePickerOpen}
                >
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="rounded border w-full  flex gap-1 py-2"
                      onClick={openLogoutTimePicker}
                    >
                      <Clock className="h-4 mt-1 text-sm" />
                      {regularizationLogoutTime ? (
                        <h1 className="text-xs mt-1">
                          {formatTimeForDisplay(regularizationLogoutTime)}
                        </h1>
                      ) : (
                        <h1 className="text-xs mt-1 dark:bg-[#0b0d29] text-[#787CA5]">
                          Logout Time
                        </h1>
                      )}
                    </button>
                  </DialogTrigger>

                  <DialogContent className="scale-75 bg-[#0a0d28] p-6">

                    <CustomTimePicker
                      selectedTime={regularizationLogoutTime}
                      onTimeChange={handleLogoutTimeChange}
                      onCancel={handleLogoutCancel}
                      onAccept={handleLogoutAccept}
                      onBackToDatePicker={() =>
                        setIsLogoutTimePickerOpen(false)
                      }
                    />

                  </DialogContent>
                </Dialog>
              </div>

              {/* Remarks Textarea */}
              <div className="relative">
                <label
                  htmlFor="remarks"
                  className="absolute bg-white dark:bg-[#0b0d29] text-[#787CA5] ml-2 text-xs -mt-2 px-1"
                >
                  Remarks
                </label>
                <textarea
                  id="remarks"
                  value={regularizationRemarks}
                  onChange={(e) => setRegularizationRemarks(e.target.value)}
                  required
                  className="w-full focus-within:border-[#815BF5] text-sm p-2 border bg-transparent outline-none rounded"
                  rows={3}
                ></textarea>
              </div>

              {/* Submit Button */}
              <div>

                <button
                  type="submit"
                  className="bg-[#815BF5] w-full text-sm cursor-pointer  text-white px-4 mt-6  py-2 rounded"
                >
                  {isSubmittingRegularization ? <Loader /> : "Submit"}
                </button>

              </div>
            </form>
          </div>
        </DialogContent >
      </Dialog >

      {/* Register Faces Modal */}
      {/* Register Face Modal */}
      <Dialog
        open={isRegisterFaceModalOpen}
        onOpenChange={setIsRegisterFaceModalOpen}
      >
        <DialogContent className="z-[100] flex w-full justify-center">
          <div className="w-full">
            <div className="flex border-b py-2  w-full justify-between ">
              <DialogTitle className="text-md  dark:text-white  px-6 py-2 font-medium">
                Register Faces (Upload 3 Images)
              </DialogTitle>
              <DialogClose className=" px-6 py-2">
                <CrossCircledIcon className="scale-150 mt-1 hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]" />
              </DialogClose>
            </div>

            <div className="space-y-4 p-6">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full text-sm   outline-none   bg-[#] flex gap-1 mt-auto text-gray-300"
              />

              <div className="grid grid-cols-3 mt-4 gap-4 mb-4">
                {selectedImages?.length > 0 &&
                  selectedImages.map((file, index) => (
                    <div key={index}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${index}`}
                        className="w-full h-auto"
                      />
                    </div>
                  ))}
              </div>

              <button
                onClick={handleFaceRegistrationSubmit}
                className="bg-[#815BF5] w-full text-sm cursor-pointer text-white px-4 mt-2 py-2 rounded"
              >
                {isLoading ? <Loader /> : "Submit Face Registration"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}
