
import styles from '../styles/Home.module.css';
import SystemStatus from "../component/SystemHealth/SystemStatus/SystemStatus";

const ApiConfigurationDashboard = () => {
  return (
    <>
      <div className={styles.container}>
     
        <header className={styles.header}>
          <h1 className={styles.title}>SIPS Connect API Dashboard</h1>
          <p className={styles.subtitle}>
            Configure adapters, test endpoints, and manage API integrations with our comprehensive dashboard
          </p>
        </header>

   
        <section className={styles.configSection}>
        </section>

      
        <section className={styles.quickAccess}>
        </section>

     
        <SystemStatus/>
      </div>
    </>
  );
};

export default ApiConfigurationDashboard;