
import React from 'react';
import DescriptionIcon from '@mui/icons-material/Description';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import FolderIcon from '@mui/icons-material/Folder';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FunctionsIcon from '@mui/icons-material/Functions';
import BuildIcon from '@mui/icons-material/Build';
import SendIcon from '@mui/icons-material/Send';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';

import CombinedReportPage from '../reports/CombinedReportPage';
import DevicesPage from '../settings/DevicesPage';
import UsersPage from '../settings/UsersPage';
import GroupsPage from '../settings/GroupsPage';
import DriversPage from '../settings/DriversPage';
import NotificationsPage from '../settings/NotificationsPage';
import CalendarsPage from '../settings/CalendarsPage';
import ComputedAttributesPage from '../settings/ComputedAttributesPage';
import MaintenancesPage from '../settings/MaintenancesPage';
import CommandsPage from '../settings/CommandsPage';
import ServerPage from '../settings/ServerPage';
import PreferencesPage from '../settings/PreferencesPage';

export const desktopApps = [
    {
        id: 'devices',
        title: 'Devices',
        icon: <ListAltIcon />,
        path: '/settings/devices',
        component: <DevicesPage />
    },
    {
        id: 'users',
        title: 'Users',
        icon: <PeopleIcon />,
        path: '/settings/users',
        component: <UsersPage />
    },
    {
        id: 'groups',
        title: 'Groups',
        icon: <FolderIcon />,
        path: '/settings/groups',
        component: <GroupsPage />
    },
    {
        id: 'drivers',
        title: 'Drivers',
        icon: <PersonPinIcon />,
        path: '/settings/drivers',
        component: <DriversPage />
    },
    {
        id: 'notifications',
        title: 'Notifications',
        icon: <NotificationsIcon />,
        path: '/settings/notifications',
        component: <NotificationsPage />
    },
    {
        id: 'calendars',
        title: 'Calendars',
        icon: <CalendarTodayIcon />,
        path: '/settings/calendars',
        component: <CalendarsPage />
    },
    {
        id: 'attributes',
        title: 'Attributes',
        icon: <FunctionsIcon />,
        path: '/settings/attributes',
        component: <ComputedAttributesPage />
    },
    {
        id: 'maintenance',
        title: 'Maintenance',
        icon: <BuildIcon />,
        path: '/settings/maintenances',
        component: <MaintenancesPage />
    },
    {
        id: 'saved_commands',
        title: 'Saved Commands',
        icon: <SendIcon />,
        path: '/settings/commands',
        component: <CommandsPage />
    },
    {
        id: 'server',
        title: 'Server',
        icon: <StorageIcon />,
        path: '/settings/server',
        component: <ServerPage />
    },
    {
        id: 'preferences',
        title: 'Preferences',
        icon: <SettingsIcon />,
        path: '/settings/preferences',
        component: <PreferencesPage />
    },
    {
        id: 'reports',
        title: 'Reports',
        icon: <DescriptionIcon />,
        path: '/reports/combined',
        component: <CombinedReportPage />
    },
];
