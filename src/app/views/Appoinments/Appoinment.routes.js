import React from 'react'
import { authRoles } from '../../auth/authRoles'

const tempElelemt = () => {
    console.log('tempElelemt')
    return <div>Temp</div>
}

const appointmentRoutes = [
    {
        path: '/appointments',
        component: React.lazy(() => import('./Appoinments')),
        auth: authRoles.dashboard,
    },
]

export default appointmentRoutes
