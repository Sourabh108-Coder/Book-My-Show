import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Home.module.css";
import { getUserId } from "@/lib/user";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MyBookings() {
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = getUserId();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/bookings", {
          headers: {
            "x-user-id": userId,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to fetch bookings");
          return;
        }

        setBookings(data.bookings);
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  if (loading) {
    return (
      <div className={styles.page_wrapper}>
        <p className={styles.loading_text}>Loading your bookings…</p>
      </div>
    );
  }

  return (
    <div className={styles.page_wrapper}>
      <ToastContainer position="top-right" />

      <button
        className={styles.secandary_button}
        onClick={() => router.back()}
      >
        ← Go Back
      </button>

      <h1 className={styles.page_title}>🎟️ My Bookings</h1>
      <p className={styles.page_subtitle}>
        Your confirmed seat reservations
      </p>

      {bookings.length === 0 ? (
        <div className={styles.empty_state}>
          <p>No bookings found</p>
          <span>Book seats to see them here</span>
        </div>
      ) : (
        <div className={styles.booking_grid}>
          {bookings.map((booking) => (
            <div key={booking.bookingId} className={styles.booking_card}>
              <div className={styles.card_header}>
                <span className={styles.booking_badge}>CONFIRMED</span>
              </div>

              <p className={styles.booking_id}>
                <strong>Booking ID:</strong>
                <span> {booking.bookingId}</span>
              </p>

              <p>
                <strong>Event:</strong> {booking.eventId}
              </p>

              <br/>

              <p>
                <strong>Seats:</strong>{" "}
                <span className={styles.seat_list}>
                  {booking.seatIds.join(", ")}
                </span>
              </p>

              <p className={styles.booking_time}>
                {new Date(booking.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
