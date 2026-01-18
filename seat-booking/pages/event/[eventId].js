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
    return <p className={styles.container}>Loading seats...</p>;
  }

  return (
    <div className={styles.container}>
      <ToastContainer position="top-right" autoClose={5000} />

      <h1 className={styles.event_head}>Event: {eventId}</h1>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.seat_grid}>
        {seats.map((seat) => {
          let seatClass = styles.available;

          if (seat.status === "BOOKED") seatClass = styles.booked;
          else if (seat.status === "HELD" && seat.heldBy === userId)
            seatClass = styles.held_by_me;
          else if (seat.status === "HELD") seatClass = styles.held_by_other;

          if (selectedSeats.includes(seat.seatId)) seatClass = styles.selected;

          return (
            <div key={seat.seatId}>
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

              {seat.status === "HELD" && seat.heldBy === userId && (
                <div className={styles.timer}>{getCountdown(seat)}s</div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.button}
          onClick={holdSeats}
          disabled={selectedSeats.length === 0}
        >
          Hold Selected Seats (2 min)
        </button>

        <button className={styles.confirm_button} onClick={confirmBooking}>
          Confirm Booking
        </button>

        <button className={styles.secandary_button} onClick={() => router.push("/my_bookings")}>
            My Bookings
        </button>

        <button className={styles.third_button} onClick={() => router.push("/")}>
                ← Go Back
        </button>
        
      </div>
    </div>
  );
}
