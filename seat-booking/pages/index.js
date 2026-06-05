import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  const goToEvent = () => {
    router.push("/event/evt_123");
  };

  return (
    <>
      <Head>
        <title>Book My Show</title>
      </Head>

     <div className={styles.landingContainer}>
       <div className={styles.landingCircle1}></div>
       <div className={styles.landingCircle2}></div>

       <div className={styles.landingCard}>
         <h1 className={styles.landingTitle}>
           Real-Time
           <span className={styles.landingHighlight}>
             {" "}Seat Booking
           </span>
         </h1>

         <p className={styles.landingSubtitle}>
           Experience instant seat reservations with live availability
           updates. No refresh needed. Fast, seamless, and reliable booking.
         </p>

         <button
           className={styles.landingButton}
           onClick={goToEvent}
         >
           🎟️ Book Your Seat
         </button>
       </div>
     </div>
    </>
  );
}