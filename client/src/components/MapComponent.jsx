import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { io } from "socket.io-client";
import L from "leaflet"; // Import L from leaflet

const socket = io(
  process.env.NODE_ENV === "production" ? "" : "http://localhost:8000",
  {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    pingInterval: 10000,
    pingTimeout: 5000,
  }
);

const LocationUpdater = ({ latitude, longitude, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (latitude && longitude) {
      map.setView([latitude, longitude], zoom);
    }
  }, [latitude, longitude, zoom, map]);
  return null;
};

const MapComponent = () => {
  const [markers, setMarkers] = useState({});
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [zoomLevel, setZoomLevel] = useState(16);
  const mapRef = useRef(null);

  const sendLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log("Sending Location:", latitude, longitude, `Accuracy: ${accuracy} meters`);
          socket.emit("send-location", { latitude, longitude });
          setUserLocation({ latitude, longitude });
          setZoomLevel(16);
        },
        (error) => {
          console.error("Error retrieving location:", error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 60000,
          maximumAge: 0,
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    let watchId = null;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log("Location sending to server:", latitude, longitude, `Accuracy: ${accuracy} meters`);
          socket.emit("send-location", { latitude, longitude });
          setUserLocation({ latitude, longitude });
        },
        (error) => {
          console.error("Error watching location:", error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 60000,
          maximumAge: 0,
        }
      );
    }

    socket.on("receive-location", ({ id, latitude, longitude }) => {
      console.log(`Received location from ${id}: ${latitude}, ${longitude}`);
      setMarkers((prevMarkers) => ({
        ...prevMarkers,
        [id]: { latitude, longitude },
      }));
    });

    socket.on("user-disconnected", (id) => {
      console.log(`User disconnected: ${id}`);
      setMarkers((prevMarkers) => {
        const updatedMarkers = { ...prevMarkers };
        delete updatedMarkers[id];
        return updatedMarkers;
      });
    });

    socket.on("connect", () => console.log("Connected to server:", socket.id));
    socket.on("disconnect", () => console.log("Disconnected from server"));
    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
    });

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Define marker icon configuration
  const markerIcon = L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png", // Default marker icon
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png", // Shadow image
    iconSize: [25, 41], // Marker size
    iconAnchor: [12, 41], // Point of the marker that corresponds to its location
    popupAnchor: [1, -34], // Popup position relative to the marker
    shadowSize: [41, 41], // Shadow size
  });

  return (
    <div>
      <button
        id="refresh-location"
        style={{
          position: "fixed",
          zIndex: 1000,
          top: "200px",
          left: "10px",
        }}
        onClick={sendLocation}
      >
        Refresh Location
      </button>
      <MapContainer
        center={[userLocation.latitude || 0, userLocation.longitude || 0]}
        zoom={zoomLevel}
        style={{ height: "100vh", width: "100%" }}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationUpdater
          latitude={userLocation.latitude}
          longitude={userLocation.longitude}
          zoom={zoomLevel}
        />
        {Object.entries(markers).map(([id, { latitude, longitude }]) => (
          <Marker
            key={id}
            position={[latitude, longitude]}
            icon={markerIcon} // Use the configured marker icon
          >
            <Popup>User {id}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;







// import React, { useEffect, useState, useRef } from "react";
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import { io } from "socket.io-client";


// const socket = io(
//   process.env.NODE_ENV === "production"
//     ? "" 
//     : "http://localhost:8000",
//   {
//     transports: ["websocket", "polling"],
//     reconnection: true,
//     reconnectionAttempts: Infinity,
//     reconnectionDelay: 1000,
//     reconnectionDelayMax: 5000,
//     pingInterval: 10000,
//     pingTimeout: 5000,
//   }
// );


// const LocationUpdater = ({ latitude, longitude, zoom }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (latitude && longitude) {
//       map.setView([latitude, longitude], zoom);
//     }
//   }, [latitude, longitude, zoom, map]);
//   return null;
// };

// const MapComponent = () => {
//   const [markers, setMarkers] = useState({});
//   const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
//   const [zoomLevel, setZoomLevel] = useState(16);
//   const mapRef = useRef(null);

//   const sendLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude, accuracy } = position.coords;
//           console.log("Sending Location:", latitude, longitude, `Accuracy: ${accuracy} meters`);
//           socket.emit("send-location", { latitude, longitude });
//           setUserLocation({ latitude, longitude });
//           setZoomLevel(16); 
//         },
//         (error) => {
//           console.error("Error retrieving location:", error.message);
//         },
//         {
//           enableHighAccuracy: true, 
//           timeout: 60000, 
//           maximumAge: 0, 
//         }
//       );
//     } else {
//       console.error("Geolocation is not supported by this browser.");
//     }
//   };

//   useEffect(() => {
//     let watchId = null;

//     if (navigator.geolocation) {
//       watchId = navigator.geolocation.watchPosition(
//         (position) => {
//           const { latitude, longitude, accuracy } = position.coords;
//           console.log("Location sending to server:", latitude, longitude, `Accuracy: ${accuracy} meters`);
//           socket.emit("send-location", { latitude, longitude });
//           setUserLocation({ latitude, longitude });
//         },
//         (error) => {
//           console.error("Error watching location:", error.message);
//         },
//         {
//           enableHighAccuracy: true, 
//           timeout: 60000, 
//           maximumAge: 0, 
//         }
//       );
//     }

//     socket.on("receive-location", ({ id, latitude, longitude }) => {
//       console.log(`Received location from ${id}: ${latitude}, ${longitude}`);
//       setMarkers((prevMarkers) => ({
//         ...prevMarkers,
//         [id]: { latitude, longitude },
//       }));
//     });

//     socket.on("user-disconnected", (id) => {
//       console.log(`User disconnected: ${id}`);
//       setMarkers((prevMarkers) => {
//         const updatedMarkers = { ...prevMarkers };
//         delete updatedMarkers[id];
//         return updatedMarkers;
//       });
//     });

//     socket.on("connect", () => console.log("Connected to server:", socket.id));
//     socket.on("disconnect", () => console.log("Disconnected from server"));
//     socket.on("connect_error", (err) => {
//       console.error("Connection error:", err.message);
//     });

//     return () => {
//       if (watchId) navigator.geolocation.clearWatch(watchId);
//       // socket.disconnect();
//     };
//   }, []);

//   return (
//     <div>
//       <button
//         id="refresh-location"
//         style={{
//           position: "fixed",
//           zIndex: 1000,
//           top: "200px",
//           left: "10px",
//         }}
//         onClick={sendLocation}
//       >
//         Refresh Location
//       </button>
//       <MapContainer
//         center={[userLocation.latitude || 0, userLocation.longitude || 0]}
//         zoom={zoomLevel}
//         style={{ height: "100vh", width: "100%" }}
//         whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
//       >
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//         <LocationUpdater
//           latitude={userLocation.latitude}
//           longitude={userLocation.longitude}
//           zoom={zoomLevel}
//         />
//         {Object.entries(markers).map(([id, { latitude, longitude }]) => (
//           <Marker key={id} position={[latitude, longitude]}>
//             <Popup>User {id}</Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// };

// export default MapComponent;
