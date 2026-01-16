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

export const desktopApps = [
    {
        id: 'devices',
        title: 'Devices',
        icon: <ListAltIcon />,
        path: '/settings/devices',
        relatedIds: ['device']
    },
    {
        id: 'users',
        title: 'Users',
        icon: <PeopleIcon />,
        path: '/settings/users',
        relatedIds: ['user']
    },
    {
        id: 'groups',
        title: 'Groups',
        icon: <FolderIcon />,
        path: '/settings/groups',
        relatedIds: ['group']
    },
    {
        id: 'drivers',
        title: 'Drivers',
        icon: <PersonPinIcon />,
        path: '/settings/drivers',
        relatedIds: ['driver']
    },
    {
        id: 'notifications',
        title: 'Notifications',
        icon: <NotificationsIcon />,
        path: '/settings/notifications',
        relatedIds: ['notification']
    },
    {
        id: 'calendars',
        title: 'Calendars',
        icon: <CalendarTodayIcon />,
        path: '/settings/calendars',
        relatedIds: ['calendar']
    },
    {
        id: 'attributes',
        title: 'Attributes',
        icon: <FunctionsIcon />,
        path: '/settings/attributes',
        relatedIds: ['attribute']
    },
    {
        id: 'maintenance',
        title: 'Maintenance',
        icon: <BuildIcon />,
        path: '/settings/maintenances',
        relatedIds: ['maintenance_item']
    },
    {
        id: 'saved_commands',
        title: 'Saved Commands',
        icon: <SendIcon />,
        path: '/settings/commands',
        relatedIds: ['command']
    },
    {
        id: 'server',
        title: 'Server',
        icon: <StorageIcon />,
        path: '/settings/server',
    },
    {
        id: 'preferences',
        title: 'Preferences',
        icon: <SettingsIcon />,
        path: '/settings/preferences',
    },
    {
        id: 'reports',
        title: 'Reports',
        icon: <DescriptionIcon />,
        path: '/reports/combined',
    },
];
