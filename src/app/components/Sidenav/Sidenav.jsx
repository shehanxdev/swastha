import React, { Fragment } from 'react'
import Scrollbar from 'react-perfect-scrollbar'
import { navigations } from 'app/navigations'
import { MatxVerticalNav } from 'app/components'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import useSettings from 'app/hooks/useSettings'
import useAuth from 'app/hooks/useAuth'

const _ = require('lodash')

const useStyles = makeStyles(({ palette, ...theme }) => ({
    scrollable: {
        paddingLeft: 20,
        paddingRight: 20,
    },
    sidenavMobileOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100vw',
        //background: 'rgba(0, 0, 0, 0.54)', //Commit by Roshan
        zIndex: -1,
        [theme.breakpoints.up('lg')]: {
            display: 'none',
        },
    },
}))

const Sidenav = ({ children }) => {
    const classes = useStyles()
    const { settings, updateSettings } = useSettings()

    const { isAuthenticated, user } = useAuth()

    let nav = []

    const getfilteredNavigations = (navList = [], roles) => {
        return navList.reduce((array, nav) => {
            if (nav.auth) {
                roles.forEach((menurole) => {
                    if (nav.auth.includes(menurole)) {
                        if (!array.includes(nav)) {
                            array.push(nav)
                        }
                    }
                })
            } else {
                if (nav.children) {
                    nav.children = getfilteredNavigations(nav.children, roles)
                    if (!array.includes(nav) && nav.children.length > 0) {
                        array.push(nav)
                    }
                } else {
                    //? added by Navindu -->
                    if (!array.includes(nav) && nav?.children?.length > 0) {
                        array.push(nav)
                    }
                }
            }

            return array
        }, [])
    }

    const createUsersideBar = () => {
        let filteredNavigations = getfilteredNavigations(
            navigations,
            user.roles
        )
        nav = filteredNavigations
        console.log('filteredNavigations', filteredNavigations)
    }

    createUsersideBar()

    const updateSidebarMode = (sidebarSettings) => {
        let activeLayoutSettingsName = settings.activeLayout + 'Settings'
        let activeLayoutSettings = settings[activeLayoutSettingsName]

        updateSettings({
            ...settings,
            [activeLayoutSettingsName]: {
                ...activeLayoutSettings,
                leftSidebar: {
                    ...activeLayoutSettings.leftSidebar,
                    ...sidebarSettings,
                },
            },
        })
    }

    return (
        <Fragment>
            <Scrollbar
                options={{ suppressScrollX: true }}
                className={clsx('relative px-4', classes.scrollable)}
            >
                {children}
                <MatxVerticalNav items={nav} />
            </Scrollbar>

            <div
                onClick={() => updateSidebarMode({ mode: 'close' })}
                className={classes.sidenavMobileOverlay}
            />
        </Fragment>
    )
}

export default Sidenav
