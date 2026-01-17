import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CombinedReportPage from '../reports/CombinedReportPage';
import DevicesPage from '../settings/DevicesPage';
import DevicePage from '../settings/DevicePage';
import DeviceConnectionsPage from '../settings/DeviceConnectionsPage';
import CommandDevicePage from '../settings/CommandDevicePage';
import SharePage from '../settings/SharePage';
import UsersPage from '../settings/UsersPage';
import UserPage from '../settings/UserPage';
import UserConnectionsPage from '../settings/UserConnectionsPage';
import GroupsPage from '../settings/GroupsPage';
import GroupPage from '../settings/GroupPage';
import GroupConnectionsPage from '../settings/GroupConnectionsPage';
import CommandGroupPage from '../settings/CommandGroupPage';
import DriversPage from '../settings/DriversPage';
import DriverPage from '../settings/DriverPage';
import NotificationsPage from '../settings/NotificationsPage';
import NotificationPage from '../settings/NotificationPage';
import CalendarsPage from '../settings/CalendarsPage';
import CalendarPage from '../settings/CalendarPage';
import ComputedAttributesPage from '../settings/ComputedAttributesPage';
import ComputedAttributePage from '../settings/ComputedAttributePage';
import MaintenancesPage from '../settings/MaintenancesPage';
import MaintenancePage from '../settings/MaintenancePage';
import CommandsPage from '../settings/CommandsPage';
import CommandPage from '../settings/CommandPage';
import ServerPage from '../settings/ServerPage';
import PreferencesPage from '../settings/PreferencesPage';
import AnnouncementPage from '../settings/AnnouncementPage';
import AccumulatorsPage from '../settings/AccumulatorsPage';
import ReplayPage from '../other/ReplayPage';
import GeofencePage from '../settings/GeofencePage';
import GeofencesPage from '../other/GeofencesPage';

const DesktopRoutes = () => {
    return (
        <Routes>
            <Route path="/settings/devices" element={<DevicesPage />} />
            <Route path="/settings/device/:id/connections" element={<DeviceConnectionsPage />} />
            <Route path="/settings/device/:id/command" element={<CommandDevicePage />} />
            <Route path="/settings/device/:id/share" element={<SharePage />} />
            <Route path="/settings/device/:id" element={<DevicePage />} />
            <Route path="/settings/device" element={<DevicePage />} />

            <Route path="/settings/users" element={<UsersPage />} />
            <Route path="/settings/user/:id/connections" element={<UserConnectionsPage />} />
            <Route path="/settings/user/:id" element={<UserPage />} />
            <Route path="/settings/user" element={<UserPage />} />

            <Route path="/settings/groups" element={<GroupsPage />} />
            <Route path="/settings/group/:id/connections" element={<GroupConnectionsPage />} />
            <Route path="/settings/group/:id/command" element={<CommandGroupPage />} />
            <Route path="/settings/group/:id" element={<GroupPage />} />
            <Route path="/settings/group" element={<GroupPage />} />

            <Route path="/settings/drivers" element={<DriversPage />} />
            <Route path="/settings/driver/:id" element={<DriverPage />} />
            <Route path="/settings/driver" element={<DriverPage />} />

            <Route path="/settings/notifications" element={<NotificationsPage />} />
            <Route path="/settings/notification/:id" element={<NotificationPage />} />
            <Route path="/settings/notification" element={<NotificationPage />} />

            <Route path="/settings/calendars" element={<CalendarsPage />} />
            <Route path="/settings/calendar/:id" element={<CalendarPage />} />
            <Route path="/settings/calendar" element={<CalendarPage />} />

            <Route path="/settings/attributes" element={<ComputedAttributesPage />} />
            <Route path="/settings/attribute/:id" element={<ComputedAttributePage />} />
            <Route path="/settings/attribute" element={<ComputedAttributePage />} />

            <Route path="/settings/maintenances" element={<MaintenancesPage />} />
            <Route path="/settings/maintenance/:id" element={<MaintenancePage />} />
            <Route path="/settings/maintenance" element={<MaintenancePage />} />

            <Route path="/settings/commands" element={<CommandsPage />} />
            <Route path="/settings/command/:id" element={<CommandPage />} />
            <Route path="/settings/command" element={<CommandPage />} />

            <Route path="/settings/server" element={<ServerPage />} />
            <Route path="/settings/preferences" element={<PreferencesPage />} />
            <Route path="/settings/announcement" element={<AnnouncementPage />} />

            <Route path="/settings/accumulators/:deviceId" element={<AccumulatorsPage />} />

            <Route path="/settings/geofence/:id" element={<GeofencePage />} />
            <Route path="/settings/geofence" element={<GeofencePage />} />
            <Route path="/settings/geofences" element={<GeofencesPage />} />

            <Route path="/reports/combined" element={<CombinedReportPage />} />
            <Route path="/replay" element={<ReplayPage />} />
        </Routes>
    );
};

export default DesktopRoutes;
