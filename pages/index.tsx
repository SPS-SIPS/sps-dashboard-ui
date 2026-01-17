import React from 'react';
import GuestDashboard from "../component/Dashboard/GuestDashboard/GuestDashboard";
import FullDashboard from "../component/Dashboard/FullDashboard/FullDashboard";
import { useAuthentication } from "../auth/AuthProvider";

const DashboardPage = () => {
    const { roles } = useAuthentication();
    const hasDashboardRole = roles.includes("dashboard");

    return (
        <>
            {hasDashboardRole ? <FullDashboard /> : <GuestDashboard />}
        </>
    );
};

export default DashboardPage;
