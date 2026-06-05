import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getUserId } from "@/lib/user";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EventPage() {
  const router = useRouter();
  const { eventId } = router.query;

  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [error, setError] = useState(null);

  const userId = getUserId();

  useEffect(() => {
    if (!eventId) return;

    const fetchSeats = async () => {
      try {
        const res = await fetch(`/api/event/${eventId}/seats`);
        const data = await res.json();
        setSeats(data.seats);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSeats();
    const interval = setInterval(fetchSeats, 2000);
    return () => clearInterval(interval);
  }, [eventId]);

  const toggleSeat = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const holdSeats = async () => {
    if (selectedSeats.length === 0) return;
    setError(null);

    try {
      const res = await fetch(`/api/event/${eventId}/hold`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ seatIds: selectedSeats }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to hold seats");
        toast.error(data.message || "Failed to hold seats");
        return;
      }

      if (data.failed && data.failed.length > 0) {
        data.failed.forEach((f) =>
          toast.error(`Seat ${f.seatId} could not be held: ${f.reason}`)
        );
      }

      if (data.held && data.held.length > 0) {
        toast.success(`Seats held: ${data.held.join(", ")}`);
      }

      setSelectedSeats([]);
    } catch (err) {
      console.error(err);
      setError("Hold request failed");
      toast.error("Hold request failed");
    }
  };

  const confirmBooking = async () => {
    const myHeldSeats = seats
      .filter((s) => s.status === "HELD" && s.heldBy === userId)
      .map((s) => s.seatId);

    if (myHeldSeats.length === 0) {
      setError("No held seats to confirm");
      toast.error("No held seats to confirm");
      return;
    }

    setError(null);

    try {
      const res = await fetch(`/api/event/${eventId}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ seatIds: myHeldSeats }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Booking failed");
        toast.error(data.message || "Booking failed");
        return;
      }

      toast.success("Booking Confirmed!");
    } catch (err) {
      console.error(err);
      setError("Booking request failed");
      toast.error("Booking request failed");
    }
  };

  const getCountdown = (seat) => {
    if (seat.status === "HELD" && seat.heldBy === userId) {
      return Math.max(Math.floor((seat.holdExpiresAt - Date.now()) / 1000), 0);
    }
    return 0;
  };

  if (loading) {
    return <p className={styles.loading_text}>Loading Seats...</p>;
  }

  return (
  <div className={styles.page}>
    <ToastContainer position="top-right" autoClose={5000} />

    <div className={styles.card}>
      
      {/* TOP */}
      <div className={styles.heroCard}>
        <h1 className={styles.eventTitle}>🎭 Real-Time Seat Booking</h1>
        <p className={styles.eventSubtitle}>
          Select your seats and watch availability update live!
        </p>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.seat} ${styles.available}`}></div>
            <span className = {styles.legtext}>Available</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.seat} ${styles.selected}`}></div>
            <span className = {styles.legtext}>Selected</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.seat} ${styles.held_by_me}`}></div>
            <span className = {styles.legtext}>Held by You</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.seat} ${styles.held_by_other}`}></div>
            <span className = {styles.legtext}>Held by Others</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.seat} ${styles.booked}`}></div>
            <span className = {styles.legtext}>Booked</span>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && <div className={styles.errorBox}>{error}</div>}

      {/* MIDDLE (SEATS) */}
      <div className={styles.seatContainer}>
        <div className={styles.seat_grid}>
          {seats.map((seat) => {
            let seatClass = styles.available;

            if (seat.status === "BOOKED") seatClass = styles.booked;
            else if (seat.status === "HELD" && seat.heldBy === userId)
              seatClass = styles.held_by_me;
            else if (seat.status === "HELD")
              seatClass = styles.held_by_other;

            if (selectedSeats.includes(seat.seatId))
              seatClass = styles.selected;

            return (
              <div key={seat.seatId} className={styles.seatWrapper}>
                <button
                  className={`${styles.seat} ${seatClass}`}
                  disabled={
                    seat.status === "BOOKED" ||
                    (seat.status === "HELD" && seat.heldBy !== userId)
                  }
                  onClick={() => toggleSeat(seat.seatId)}
                >
                  {seat.seatId}
                </button>

                {seat.status === "HELD" &&
                  seat.heldBy === userId && (
                    <div className={styles.timer}>
                      ⏳ {getCountdown(seat)}s
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM */}
      <div className={styles.actions}>
        <button
          className={styles.holdButton}
          onClick={holdSeats}
          disabled={selectedSeats.length === 0}
        >
          🎟 Hold Seats
        </button>

        <button
          className={styles.confirmButton}
          onClick={confirmBooking}
        >
          ✅ Confirm Booking
        </button>

        <button
          className={styles.bookingButton}
          onClick={() => router.push("/my_bookings")}
        >
          📋 My Bookings
        </button>

        <button
          className={styles.backButton}
          onClick={() => router.push("/")}
        >
          ← Back Home
        </button>
      </div>

    </div>
  </div>
);
}