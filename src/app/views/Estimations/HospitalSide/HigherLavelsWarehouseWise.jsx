import React, { Component, Fragment } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { TextValidator } from 'react-material-ui-form-validator'
import { ValidatorForm } from 'app/components/LoonsLabComponents'
import {
    Grid,
    IconButton,
    Icon,
    Tabs,
    Tab,
    Tooltip,
    CircularProgress,
    Dialog
} from '@material-ui/core'
import VisibilityIcon from '@material-ui/icons/Visibility'
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import moment from 'moment';

import { Autocomplete } from '@material-ui/lab'
import 'date-fns'
import { yearMonthParse, dateParse, yearParse, includesArrayElements } from 'utils'

import {
    DatePicker,
    Button,
    LoonsSnackbar,
    MainContainer,
    LoonsCard,
    LoonsTable,
    CardTitle,
    SubTitle,
    FilePicker,
    ImageView,
} from 'app/components/LoonsLabComponents'
import CloseIcon from '@material-ui/icons/Close';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EditIcon from '@mui/icons-material/Edit';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import * as appConst from '../../../../appconst'
import EstimationService from 'app/services/EstimationService'
import InventoryService from 'app/services/InventoryService'
import ClinicService from 'app/services/ClinicService'
import localStorageService from 'app/services/localStorageService'
import AssignPharmacist from './AssignPharmacist'
import AddRoadIcon from '@mui/icons-material/AddRoad';

import FiltersEstimation from '../FiltersEstimation'
import MyPendingAppovels from './MyPendingAppovels'
import MyApproved from './MyApproved'

const styleSheet = (theme) => ({
    Dialogroot: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    root: {
        display: 'flex',
    },
})

class HigherLavelsWarehouseWise extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeTab: 0,
            disableInstitiute: false,
            submitting: false,
            gerarating: false,
            loaded: false,
            assignPharmacist: false,
            selectedEstimation: null,
            alert: false,
            message: '',
            severity: 'success',
            userRoles: [],
            filterData: {
                status: ['Pending Approvals'],
                year: null,
                owner_id: null,
                page: 0,
                limit: 20,
                'order[0]': ['createdAt', 'DESC']
            },
            edit: false,
            editEstimationId: null,

            data: [],
            estimationStageData:[],
            columns: [
                {
                    name: 'Action',
                    label: 'Action',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            return <Grid className="flex items-center" >
                                {
                                    <div className='flex row'>

                                        <Tooltip title="View All Estimations">
                                            <IconButton
                                                onClick={() => {
                                                    window.location.href = `/estimation/director_estimation_items/${this.state.data[dataIndex].id}/${this.state.data[dataIndex].warehouse_id}`

                                                }}>
                                                <VisibilityIcon color='primary' />
                                            </IconButton>
                                        </Tooltip>

                                        {includesArrayElements(this.state.userRoles, ['MSD AD']) &&
                                            <Tooltip title="Add New items">
                                                <IconButton
                                                    onClick={() => {
                                                        window.location.href = `/estimation/cp_estimation_items/${this.state.data[dataIndex].id}/${this.state.data[dataIndex].warehouse_id}`

                                                    }}>
                                                    <AddRoadIcon color='primary' />
                                                </IconButton>
                                            </Tooltip>
                                        }

                                        {!includesArrayElements(this.state.userRoles, ['MSD AD']) &&
                                            <Tooltip title="View Items">
                                                <IconButton
                                                    onClick={() => {
                                                        window.location.href = `/estimation/cp_estimation_items/${this.state.data[dataIndex].id}/${this.state.data[dataIndex].warehouse_id}`

                                                    }}>
                                                    <AddRoadIcon color='primary' />
                                                </IconButton>
                                            </Tooltip>
                                        }
                                    </div>
                                }

                            </Grid >
                        },
                    },
                },
                {
                    name: 'Year',
                    label: 'Year',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex]?.Estimation?.EstimationSetup?.year
                            return data
                        },
                    },
                },
                {
                    name: 'name',
                    label: 'Name',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex]?.Estimation?.name
                            return data
                        },
                    },
                },

                {
                    name: 'type',
                    label: 'Type',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex]?.Estimation?.type
                            return data
                        },
                    },
                },

                {
                    name: 'institute_category',
                    label: 'Institute Category',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex]?.Estimation?.institute_category
                            return data
                        },
                    },
                },
                {
                    name: 'institute',
                    label: 'Institution',
                    options: {
                        display: true,
                        customBodyRenderLite: (dataIndex) => {
                            return (this.state.data[dataIndex]?.institute + ' (' + this.state.data[dataIndex]?.Department?.name + ')')
                        }
                    }
                },
                {
                    name: 'warehouse',
                    label: 'Warehouse',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex]?.Warehouse?.name
                            return data
                        },
                    },
                },
                {
                    name: 'from',
                    label: 'From',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex]?.Estimation?.from
                            return dateParse(data)
                        },
                    },
                },
                {
                    name: 'to',
                    label: 'To',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex]?.Estimation?.to
                            return dateParse(data)
                        },
                    },
                },
                {
                    name: 'start_date',
                    label: 'Submission Start Date',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex]?.Estimation?.start_date
                            return dateParse(data)
                        },
                    },
                },
                {
                    name: 'end_date',
                    label: 'Submission End Date',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex]?.Estimation?.end_date
                            return dateParse(data)
                        },
                    },
                },
                {
                    name: 'end_date',
                    label: 'Devisional Pharmacist Required Date',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex]?.Estimation?.dp_required_date
                            return dateParse(data)
                        },
                    },
                },
                {
                    name: 'massage',
                    label: 'Message',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex]?.Estimation?.massage
                            return data
                        },
                    },

                },
                {
                    name: 'status',
                    label: 'Status',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex]?.status
                            return data
                        },
                    }
                },
                {
                    name: 'Approval Stage',
                    label: 'Approval Stage',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex]?.id
                            let toWho=this.state.estimationStageData.filter((x)=>x.hospital_estimation_id==data)
                            return toWho[0]?.approval_user_type
                        },
                    }
                },


            ]
        }
    }

    async loadData() {
        this.setState({ loaded: false })
        let res = await EstimationService.getEstimations(this.state.filterData)
        if (res.status == 200) {
            console.log("estimation data", res.data.view.data)
            if (res.data.view.data.length > 0) {
                this.getPharmacyDet(res.data.view.data)
                let estimationIds = res.data.view.data.map(x => x.id)
                this.loadEstimationStage(estimationIds)
            } else {
                this.setState({
                    loaded: true,
                    data: []
                })
            }

            this.setState({
                //data: res.data.view.data,
                totalItems: res.data.view.totalItems,

            })
        }
    }

    async loadEstimationStage(estimationIds) {
        this.setState({ loaded: false })
        let params = {
            status: 'Pending',
            districts: this.state.filterData.districts,
            institute_type: this.state.filterData.institute_type,
            hospital_estimation_id: estimationIds
        }
        let res = await EstimationService.getEstimationsApprovals(params)
        if (res.status == 200) {
            console.log("estimation stage data", res.data.view.data)

            this.setState({
                estimationStageData: res.data.view.data
            })
        }



    }



    async setPage(page) {
        let filterData = this.state.filterData
        filterData.page = page
        this.setState({ filterData }, () => { this.loadData() })
    }






    async getPharmacyDet(mainData) {

        let params = {
            issuance_type: ["Hospital", "RMSD Main"],
            // limit: 1, 
            // page: 0,
            'order[0]': ['createdAt', 'ASC'],
            selected_owner_id: mainData?.map(x => x.Warehouse?.owner_id)
        };

        let res = await ClinicService.fetchAllClinicsNew(params, null);


        let updatedArray = []
        if (res.status == 200) {


            updatedArray = mainData.map((obj1) => {
                const obj2 = res.data?.view?.data?.find((obj) => obj.owner_id === obj1.Warehouse?.owner_id);

                obj1.institute = obj2?.name
                obj1.Department = obj2?.Department

                return obj1;
            });

        }
        console.log('last data estimations', updatedArray)
        this.setState(
            { data: updatedArray, loaded: true }

        )

    }

    async componentDidMount() {
        var owner_id = await localStorageService.getItem('owner_id');
        let user_info = await localStorageService.getItem('userInfo')
        let district = await localStorageService.getItem('login_user_pharmacy_drugs_stores')[0]?.Pharmacy_drugs_store?.district

        this.setState({ userRoles: user_info.roles })

        let filterData = this.state.filterData
        if (owner_id != '000') {
            if (includesArrayElements(user_info.roles, ['Devisional Pharmacist', 'RDHS'])) {
                filterData.districts = district
                filterData.institute_type = 'Provincial'
                this.setState({ disableInstitiute: false })
            } else {

                filterData.owner_id = owner_id
                this.setState({ disableInstitiute: true })
            }
        }

        this.setState({ filterData }, () => { this.loadData(); })


    }

    handleTabChange = (event, newValue) => {
        let filterData = this.state.filterData
        if (newValue == 1) {
            filterData.status = ['Pending Approvals',]
            this.setState({ activeTab: newValue, filterData }, () => { this.setPage(0) });
        } else if (newValue == 2) {
            filterData.status = ['APPROVED']
            this.setState({ activeTab: newValue, filterData }, () => { this.setPage(0) });
        } else {
            this.setState({ activeTab: newValue });

        }


    };

    render() {
        const { classes } = this.props
        return (
            < Fragment >
                <MainContainer>
                    <LoonsCard className="mt-3">
                        <CardTitle title="Forecasted Estimation Details" />
                        <div>
                            <Tabs
                                value={this.state.activeTab}
                                onChange={this.handleTabChange}

                                style={{ minHeight: 39, height: 26 }}
                                indicatorColor="primary"
                                variant='fullWidth'
                                textColor="primary"
                            >
                                <Tab label="MY PENDING APPROVALS" />
                                <Tab label="PENDING APPROVALS" />
                                <Tab label="All APPROVED" />
                                <Tab label="MY APPROVED" />

                            </Tabs>
                        </div>









                        {this.state.activeTab == 0 &&
                            <MyPendingAppovels></MyPendingAppovels>
                        }

                        {(this.state.activeTab == 1 || this.state.activeTab == 2) &&
                            <div>
                                <FiltersEstimation
                                    disableInstitiute={this.state.disableInstitiute}
                                    onSubmit={(data) => {
                                        let filterData = this.state.filterData
                                        filterData = { ...filterData, ...data }
                                        // Object.assign(filterData, data)
                                        this.setState({ filterData }, () => {
                                            this.setPage(0)
                                        })
                                    }}
                                ></FiltersEstimation>

                                <Grid className='mt-10'>


                                    {this.state.loaded ?
                                        <LoonsTable
                                            className="mt-5"
                                            //title={"All Aptitute Tests"}

                                            id={'estimationStups'}
                                            // title={'Active Prescription'}
                                            data={this.state.data}
                                            columns={this.state.columns}
                                            options={{
                                                pagination: true,
                                                serverSide: true,
                                                count: this.state.totalItems,
                                                // count: 10,
                                                rowsPerPage: this.state.filterData.limit,
                                                page: this.state.filterData.page,
                                                print: false,
                                                viewColumns: false,
                                                download: false,
                                                onRowClick: this.onRowClick,
                                                onTableChange: (action, tableState) => {
                                                    console.log(action, tableState)
                                                    switch (action) {
                                                        case 'changePage':
                                                            this.setPage(tableState.page)
                                                            break
                                                        case 'sort':
                                                            //this.sort(tableState.page, tableState.sortOrder);
                                                            break
                                                        default:
                                                            console.log(
                                                                'action not handled.'
                                                            )
                                                    }
                                                },
                                            }}
                                        ></LoonsTable>
                                        :
                                        <Grid className="justify-center text-center w-full pt-12">
                                            <CircularProgress
                                                size={30}
                                            />
                                        </Grid>
                                    }
                                </Grid>

                            </div>

                        }

                        {this.state.activeTab == 3 &&
                            <MyApproved></MyApproved>
                        }



                        <Grid className="justify-center text-center w-full pt-12">
                            {/* <CircularProgress
                                size={30}
                            /> */}
                        </Grid>

                    </LoonsCard>
                </MainContainer>


                <Dialog fullWidth maxWidth="lg" open={this.state.assignPharmacist} onClose={() => { this.setState({ assignPharmacist: false }) }}  >
                    <MuiDialogTitle disableTypography className={classes.Dialogroot}>

                        <CardTitle title="Assign Pharmacist" />
                        <IconButton aria-label="close" className={classes.closeButton}
                            onClick={() => {
                                this.setState({
                                    assignPharmacist: false

                                })
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </MuiDialogTitle>
                    <MainContainer>

                    </MainContainer>
                </Dialog>

                <LoonsSnackbar
                    open={this.state.alert}
                    onClose={() => {
                        this.setState({ alert: false })
                    }}
                    message={this.state.message}
                    autoHideDuration={3000}
                    severity={this.state.severity}
                    elevation={2}
                    variant="filled"
                ></LoonsSnackbar>
            </Fragment>
        )
    }
}

export default withStyles(styleSheet)(HigherLavelsWarehouseWise)