import React, { Component, Fragment } from "react";
import MainContainer from "../../../components/LoonsLabComponents/MainContainer";
import CardTitle from "../../../components/LoonsLabComponents/CardTitle";
import LoonsCard from "../../../components/LoonsLabComponents/LoonsCard";
import { CircularProgress, Divider, Grid, Icon, IconButton, InputAdornment, Tooltip, Typography,  Dialog,
    DialogActions,DialogContent,TextField, Fab,} from "@material-ui/core";
    import { TextValidator } from 'react-material-ui-form-validator'
import { ValidatorForm } from 'app/components/LoonsLabComponents'
    import { Button,DatePicker,LoonsTable,LoonsSnackbar} from "app/components/LoonsLabComponents";
import SubTitle from "../../../components/LoonsLabComponents/SubTitle";
import Paper from '@material-ui/core/Paper';
import { Autocomplete } from "@mui/material";
import CloseIcon from '@material-ui/icons/Close';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import TaskIcon from '@mui/icons-material/Task';
import VisibilityIcon from '@material-ui/icons/Visibility'
import InventoryService from 'app/services/InventoryService'
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import AddIcon from '@material-ui/icons/Add';
import LoonsButton from 'app/components/LoonsLabComponents/Button'
import { dateParse } from "utils";
import * as appConst from '../../../../appconst'
import { withStyles } from '@material-ui/core/styles'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import DeleteIcon from '@material-ui/icons/Delete';

import QualityAssuranceService from 'app/services/QualityAssuranceService'
import HospitalConfigServices from 'app/services/HospitalConfigServices';
import EmployeeServices from 'app/services/EmployeeServices'
import WarehouseServices from "app/services/WarehouseServices";
import localStorageService from 'app/services/localStorageService'
import DonarService from '../../../services/DonarService'
import MSDReport from '../Prints/MSDreport'
import PrintIcon from '@mui/icons-material/Print';

import { PrintHandleBar } from 'app/components/LoonsLabComponents'
const drawerWidth = 270;

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
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        backgroundColor: "#bad4ec"
        // backgroundColor: themeColors['whiteBlueTopBar'].palette.primary.main
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth - 80}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    },
    content: {
        flexGrow: 1,
        //padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: -80,
    },
})

class QACurrentRequests extends Component {
    constructor(props) {
        super(props)

        this.viewContentRef = React.createRef();
        this.state = {
            alert: false,
            message: '',
            severity: 'success',

            classes: styleSheet,
            loading: true,
            sr_no: [],
            totalItems: 0,
          formData:{
            search:null
          },
          changeTab:false,
          selectedRows:[],
            all_warehouse_loaded: null,
            sampleSubmitDialog:false,
            qualityissueApproveDialog:false,
            empData: [],
            // totalItems: 0,
            batchTable:false,
            batchArray:[],
            filterData: {
                limit: 10,
                page: 0,
                'order[0]': ['updatedAt', 'DESC'],
            },
            qaIncidents:[],
            qaIncidentsLoaded:null,

            printData : null,
            printLoad : false,
            
            data:[],
            pending: 0,
            columns: [
                {
                    name: 'sr_no', // field name in the row object
                    label: 'SR No', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return this.state.data[tableMeta.rowIndex]?.ItemSnap?.sr_no
                        },
                    },
                },
                {
                    name: 'item_name', // field name in the row object
                    label: 'Item Name', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return this.state.data[tableMeta.rowIndex]?.ItemSnap?.medium_description
                        },
                    },
                },
                {
                    name: 'nmqal_no', // field name in the row object
                    label: 'NMQL No', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        // customBodyRender: (value, tableMeta, updateValue) => {
                        //     return this.state.data[tableMeta.rowIndex]?.log_no
                        // },
                    },
                },
                // {
                //     name: 'sr_no', // field name in the row object
                //     label: 'SR NO', // column title that will be shown in table
                //     options: {
                //         filter: true,
                //         display: true,
                //         width: 10,
                //         customBodyRender: (value, tableMeta, updateValue) => {
                //             return this.state.data[tableMeta.rowIndex]?.ItemSnapBatch?.ItemSnap?.sr_no
                //         },
                //     },
                // },
                // {
                //     name: 'item_name', // field name in the row object
                //     label: 'Item Name', // column title that will be shown in table
                //     options: {
                //         filter: true,
                //         display: true,
                //         width: 10,
                //         customBodyRender: (value, tableMeta, updateValue) => {
                //             return this.state.data[tableMeta.rowIndex]?.ItemSnapBatch?.ItemSnap?.medium_description
                //         },
                //     },
                // },
                {
                    name: 'mfd', // field name in the row object
                    label: 'NMQL Report Issued by', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return this.state.data[tableMeta.rowIndex]?.NmqalReportBy?.name
                        },
                    },
                },
                {
                    name: 'mfd', // field name in the row object
                    label: 'NMQL Report Issued date', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return dateParse(this.state.data[tableMeta.rowIndex]?.NmqalReportBy?.createdAt)
                        },
                    },
                },
                {
                    name: 'reported_date', // field name in the row object
                    label: 'Reported Date', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            let data= this.state.data[tableMeta.rowIndex]?.complain_date
                            return dateParse(data)
                        },
                    },
                },
                {
                    name: 'status', // field name in the row object
                    label: 'Status', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        // customBodyRender: (value, tableMeta, updateValue) => {
                        //     return this.state.data[tableMeta.rowIndex]?.Complaint_by?.name
                        // },
                    },
                },
                {
                    name: 'nmqal_recommendations', // field name in the row object
                    label: 'NMQL Recommendation', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        // customBodyRender: (value, tableMeta, updateValue) => {
                        //     return this.state.data[tableMeta.rowIndex]?.Complaint_by?.name
                        // },
                    },
                },
              
                // {
                //     name: 'sample_submit_status', // field name in the row object
                //     label: 'Sample submit status', // column title that will be shown in table
                //     options: {
                //         filter: true,
                //         display: true,
                //         width: 10,
                //           customBodyRender: (value, tableMeta, updateValue) => {
                //             return (
                //                 <> 
                //                 <Grid container>
                //                  <Button
                //                 color="secondary"
                //                 className="mr-1"
                //                 disabled={false}
                //                 onClick={() => {
                //                   this.setState({
                //                                 sampleSubmitDialog: true,
                //                             })
                //              }} 
                //             >
                //                 Sample Submitted
                //             </Button>


                                
                //                 </Grid>
                              
                //                 </>
                               
                //             )
                         

                //         },
                //     },
                // },
                // {
                //     name: 'certificate of quality', // field name in the row object
                //     label: 'Certidicate of Quality', // column title that will be shown in table
                //     options: {
                //         filter: true,
                //         display: true,
                //         width: 10,
                //         customBodyRender: (value, tableMeta, updateValue) => {
                //             return (
                //                 <> 
                //                 <Grid container>
                //                 <Grid  className=" w-full"
                //                        item
                //                        lg={6}
                //                        md={6}
                //                        sm={12}
                //                        xs={12} >
                //                          <IconButton
                //                         // onClick={() => {
                //                         //     window.location.href = `/donation/view-donation-items/${id}/${donar_id}`
                //                         // }}
                //                         className="px-2"
                //                         size="small"
                //                         aria-label="View Item"
                //                     >
                //                         <NoteAddIcon />
                //                     </IconButton>
                             


                //                 </Grid>
                //                 </Grid>
                              
                //                 </>
                               
                //             )
                         

                //         },
                //     },
                // },
                // {
                //     name: 'circular_report', // field name in the row object
                //     label: 'Circular Report', // column title that will be shown in table
                //     options: {
                //         filter: true,
                //         display: true,
                //         width: 10,
                //         customBodyRender: (value, tableMeta, updateValue) => {
                //             return (
                //                 <> 
                //                 <Grid container>
                //                 <Grid  className=" w-full"
                //                        item
                //                        lg={6}
                //                        md={6}
                //                        sm={12}
                //                        xs={12} >
                //                            <IconButton
                //                         // onClick={() => {
                //                         //     window.location.href = `/donation/view-donation-items/${id}/${donar_id}`
                //                         // }}
                //                         className="px-2"
                //                         size="small"
                //                         aria-label="View Item"
                //                     >
                //                         <TaskIcon />
                //                     </IconButton>

                //                 </Grid>
                //                 </Grid>
                              
                //                 </>
                               
                //             )
                         

                //         },
                //     },
                // },
                {
                    name: 'action',
                    label: 'Action',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let id = this.state.data[dataIndex].id
                            // let donar_id = this.state.data[dataIndex]?.Donor?.id
                            // [dataIndex]?.Donor?.id
                            return (
                                <Grid className="flex items-center">
                                    <Tooltip title="View Item">
                                    <IconButton
                                    disabled={this.state.data[dataIndex].status =='NMRA Approved'?false:true}
                                        onClick={() => {
                                            this.LoadQualityIncident(id)
                                        //    this.setState({
                                        //     qualityissueApproveDialog:true
                                        //    })
                                        }}
                                        // className="px-2"
                                        size="small"
                                        aria-label="View Item"
                                        color="primary"
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                       
                                    </Tooltip>


                                    <Tooltip title="Circular Report">
                                    <IconButton
                                    // disabled={this.state.data[dataIndex].status =='NMRA Approved'?false:true}
                                    onClick={() => { window.location = `/qualityAssurance/circular_report/${id}` }}
                                        // className="px-2"
                                        size="small"
                                        aria-label="Circular Report"
                                        color="primary"
                                    >
                                        <AddIcon />
                                    </IconButton>
                                       
                                    </Tooltip>

                                    {this.state.data[dataIndex].status ==='Circular Generated' ?
                                    <Tooltip title="Print">
                                    <IconButton
                                    // disabled={this.state.data[dataIndex].status =='NMRA Approved'?false:true}
                                    onClick={() => { this.printFunc(id) }}
                                        // className="px-2"
                                        size="small"
                                        aria-label="View Item"
                                        color="primary"
                                    >
                                        <PrintIcon />
                                    </IconButton>
                                       
                                    </Tooltip>
                                    :null }
                                  
                                </Grid>
                            )
                        },
                    },
                },
            ],

            qaIncidentscolumns: [
                {
                    name: 'log_no', // field name in the row object
                    label: 'Log No', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            console.log("data22",this.state.qaIncidents[tableMeta.rowIndex]?.log_no)
                            return this.state.qaIncidents[tableMeta.rowIndex]?.log_no
                        },
                    },
                },
                // {
                //     name: 'sr_no', // field name in the row object
                //     label: 'SR NO', // column title that will be shown in table
                //     options: {
                //         filter: true,
                //         display: true,
                //         width: 10,
                //         customBodyRender: (value, tableMeta, updateValue) => {
                //             return this.state.qaIncidents[tableMeta.rowIndex]?.ItemSnapBatch?.ItemSnap?.sr_no
                //         },
                //     },
                // },
                // {
                //     name: 'item_name', // field name in the row object
                //     label: 'Item Name', // column title that will be shown in table
                //     options: {
                //         filter: true,
                //         display: true,
                //         width: 10,
                //         customBodyRender: (value, tableMeta, updateValue) => {
                //             return this.state.qaIncidents[tableMeta.rowIndex]?.ItemSnapBatch?.ItemSnap?.medium_description
                //         },
                //     },
                // },
                {
                    name: 'mfd', // field name in the row object
                    label: 'Manufacture Date', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        // customBodyRender: (value, tableMeta, updateValue) => {
                        //     return this.state.qaIncidents[tableMeta.rowIndex]?.ItemSnapBatch?.batch_no
                        // },
                    },
                },
                {
                    name: 'mfd', // field name in the row object
                    label: 'Manufacture Date', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return dateParse(this.state.qaIncidents[tableMeta.rowIndex]?.ItemSnapBatch?.mfd)
                        },
                    },
                },
                {
                    name: 'reported_date', // field name in the row object
                    label: 'Reported Date', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            let qaIncidents= this.state.qaIncidents[tableMeta.rowIndex]?.Complaint_by?.createdAt
                            return dateParse(qaIncidents)
                        },
                    },
                },
                {
                    name: 'consultant_initiated', // field name in the row object
                    label: 'Consultant Initiated', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return this.state.qaIncidents[tableMeta.rowIndex]?.Complaint_by?.name
                        },
                    },
                },
                {
                    name: 'sample_submit_status', // field name in the row object
                    label: 'Sample Submit Status', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                          customBodyRender: (value, tableMeta, updateValue) => {
                            return (
                                <> 
                                <Grid container>
                                 <Button
                                color="secondary"
                                className="mr-1"
                                disabled={false}
                            //     onClick={() => {
                            //       this.setState({
                            //         sampleSubmitDialog: true,
                            //                 })
                            //  }} 
                            >
                                Sample Submitted
                            </Button>
                                </Grid>
                                </>
                            )
                         },
                    },
                },
                {
                    name: 'action',
                    label: 'Action',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            // let id = this.state.data[dataIndex].id
                            // let donar_id = this.state.data[dataIndex]?.Donor?.id
                            // [dataIndex]?.Donor?.id
                            return (
                                <Grid className="flex items-center">
                                    <Tooltip title="View Item">
                                    <IconButton
                                        onClick={() => {
                                        
                                        //    this.setState({
                                        //     qualityissueApproveDialog:true
                                        //    })
                                        }}
                                        // className="px-2"
                                        size="small"
                                        aria-label="View Item"
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                       
                                    </Tooltip>
                                  
                                </Grid>
                            )
                        },
                    },
                },
                {
                    name: 'mfd', // field name in the row object
                    label: 'LR NO', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 20,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return(
                                <Grid container>
                                <Grid className="mt-1" item lg={4}>
                                <TextValidator
                                    // id={'Hello' + this.state.qaIncidents[tableMeta.rowIndex].rowIndex}
                                    defaultValue={value != null ? value : 0}
                                    style={{
                                        width: 80
                                    }}
                                    variant="outlined"
                                    size="small"
                                    disabled={this.state.qaIncidents[tableMeta.rowIndex].lr_added == true ? true : false}
                                    onChange={(e) => {
                                        // this
                                        //     .state
                                        //     .cartStatus[tableMeta.rowIndex]
                                        //     .order_quantity = e.target.value

                                        let qaIncidents =  this.state.qaIncidents;
                                        qaIncidents[tableMeta.rowIndex].lr_no = e.target.value
                                        this.setState({ qaIncidents },
                                            console.log("cartStatus", qaIncidents[tableMeta.rowIndex].lr_no))
                                    }}></TextValidator>
                                
                            </Grid>
                            <Grid className="ml-1" item lg={3}>

                            </Grid>
                            <Grid className="ml-1" item lg={1}>
                            <Tooltip title="Allocate">
                                            <IconButton
                                            disabled={this.state.qaIncidents[tableMeta.rowIndex].lr_added == true ? true : false}
                                                onClick={() => {
                                                    let qaIncidents =  this.state.qaIncidents
                                                    qaIncidents[tableMeta.rowIndex].lr_added = true
                                                    this.selectedRows(qaIncidents[tableMeta.rowIndex])    
                                                     this.setState({
                                                        batchTable:true
                                                     })
                                                     
                                                    // window.location.href = `/msd/check-store-space/${id}`
                                                }}
                                                >
                                                <AddIcon color='primary' />
                                            </IconButton>
                                 </Tooltip>

                                </Grid>
                                </Grid>
                            
                            )
                        },
                    },
                },
            ],

            batchTable_coloums: [
                {
                    name: 'batch_no', // field name in the row object
                    label: 'Batch No', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return this.state.qaIncidents[tableMeta.rowIndex]?.QualityIncident?.ItemSnapBatch?.batch_no
                        },
                    },
                },
                {
                    name: 'log_no', // field name in the row object
                    label: 'Log No', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return this.state.qaIncidents[tableMeta.rowIndex]?.QualityIncident?.log_no
                        },
                    },
                },
                {
                    name: 'sr_no', // field name in the row object
                    label: 'SR NO', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return this.state.qaIncidents[tableMeta.rowIndex]?.QualityIncident?.ItemSnapBatch?.ItemSnap?.sr_no
                        },
                    },
                },
                {
                    name: 'lr_no', // field name in the row object
                    label: 'LR No', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return this.state.qaIncidents[tableMeta.rowIndex]?.log_report_no
                        },
                    },
                },
            ],
            testArray:[
                {
                    test_id: null,
                    specification_id: null,
                    result_id: null,
                }
            ],
            log_details:[
                {
                    qualityincident_id: null,
                    log_report_no: null,
                    source: null,
                    lr_no: null,
                }
            ]
            // totalItems: 0,
         
        }
    }
    async approve() {
       
        let formData = this.state.formData
        let id = formData.id
        let data ={
            status:'MSD Circular Generated',
        }
        console.log('approve',data)
        let res = await QualityAssuranceService.approvalORejectionNMQL(data,id)
        console.log('Res===========>', res)
        if (200 == res.status) {
            this.setState({
                alert: true,
                message: 'Create Issue Successfully ',
                severity: 'success',
            },() => {
                window.location.reload()
            })
            this.LoadData()
        } else {
            this.setState({
                alert: true,
                message: 'Create Issue was Unsuccessful',
                severity: 'error',
            })
        }
    }

    async submit(){
        console.log('selectableRows',this.state.selectedRows)
        let data = {
        // log_details:log_details,
        // tests:this.state.testArray,
        // reason_for_sending:formData.reason_for_sending,
        // analytical_report:formData.analytical_report,
        // nmqal_recommendations:formData.nmqal_recommendations,
        // nmqal_remarks:formData.nmqal_remarks,
        // created_by:JSON.parse(localStorage.getItem('userInfo')).id,
        // nmqal_reportby:JSON.parse(localStorage.getItem('userInfo')).id,
       
        }
        // let res = await QualityAssuranceService.AddingNQMLrecommendation(data)
        // console.log('Res===========>', res)
        // if (201 == res.status) {
        //     this.setState({
        //         alert: true,
        //         message: 'Create Issue Successfully ',
        //         severity: 'success',
        //     },() => {
        //         // window.location.reload()
        //     })
        //     this.LoadData()
        // } else {
        //     this.setState({
        //         alert: true,
        //         message: 'Create Issue was Unsuccessful',
        //         severity: 'error',
        //     })
        // }

        console.log("data",data)
        console.log('log_details',data)
    }
    async onChangeTestDataValue(index, name, value) {
        let testArray = this.state.testArray
        testArray[index][name] = value
        console.log("testArray",testArray)
        this.setState({ testArray })
    }
    async testDataGET() {
        // let params 
        // params.type = 'Test'
        const res = await QualityAssuranceService.QAAssuranceSetup()
        // {type:'Test'}
        if (200 == res.status) {
            // filterData.page = res.data.view.currentPage
            this.setState(
                {
                    testData: res.data.view.data,
                    // totalPages: res.data.view.totalPages,
                    // totalItems: res.data.view.totalItems,
                    // tableDataLoaded: true,
                },
            )
        }
    }
    addNewTest() {
        let testArray = this.state.testArray;
        let test_details = testArray;     
        testArray.push({
                        test_id: null,
                        specification_id: null,
                        result_id: null,
                     })
        testArray = test_details;
        this.setState({ testArray })
    }
    removeRow(i,value) {
        console.log("row",i,value)
        let testArray = this.state.testArray
       
        let index3 = testArray.indexOf(value)
        
        // formData.batch_details[index].packaging_details[index2][name] = value.id
        testArray.splice(index3,1)
        // let formData = this.state.formData
        // formData.batch_details[i].packaging_details.delete(row)
        this.setState({ testArray })
    }

    async printFunc(id) {

        let params = {
            nmqal_recommendation_id : id,
            status : 'Active',
        }

        let res = await QualityAssuranceService.GetQaCirculars(params)

        if (res.status === 200){
            console.log('chheking datatatta', res)
            this.setState({
                printData : res.data.view.data[0]?.template,
                printLoad : true,
            })
        }

    }



    async LoadAllManufacturers() {
        let params = {}

        let res = await HospitalConfigServices.getAllManufacturers(params)
        if (res.status) {
            console.log("all Manufacturers", res.data.view.data)
            this.setState({
                all_manufacturers: res.data.view.data,

            })
        }
    }

    async loadWarehouses() {
        var user = await localStorageService.getItem('userInfo');
        var id = user.id;
        var all_pharmacy_dummy = [];

        let params = { employee_id: id }
        let res = await WarehouseServices.getWareHouseUsers(params);
        if (res.status == 200) {
            console.log("warehouseUsers", res.data.view.data)

            res.data.view.data.forEach(element => {
                all_pharmacy_dummy.push(
                    {
                        warehouse: element.Warehouse,
                        name: element.Warehouse.name,
                        main_or_personal: element.Warehouse.main_or_personal,
                        owner_id: element.Warehouse.owner_id,
                        id: element.warehouse_id,
                        pharmacy_drugs_stores_id: element.Warehouse.pharmacy_drugs_store_id,
                    }

                )
            });
            console.log("warehouse", all_pharmacy_dummy)
            this.setState({ all_warehouse_loaded: all_pharmacy_dummy })
        }
    }
    async setPage(page) {
        let params = this.state.filterData
        params.page = page
        this.setState(
            {
                params,
            },
            () => {
                this.LoadData()
            }
        )
    }

    componentDidMount() {
        this.loadWarehouses()
        this.LoadData()
        this.LoadAllManufacturers()
        this.testDataGET()
    }
    async LoadData() {
        this.setState({ loading: false })
        let params = {
            
            // status : 'NMRA Approved'
        }
        let res = await QualityAssuranceService.getAllNMQLRecommendations(this.state.filterData)
        if (res.status == 200) {
            this.setState({
                data: res.data.view.data,
                totalItems:res.data.view.totalItems,
                loading: true
            },() =>
            console.log("State 1----------------------------------:", this.state.data)
             )
        }   
     }  
     async LoadQualityIncident(id){
        this.setState({ qaIncidentsLoaded: false })
        console.log("State 1:", id)
        let params = {
            // item_batch_id:id,
            page : 0,
            limit : 10
        }
        let res = await QualityAssuranceService.getNMQLRecommendationByID(id,params)
        if (res.status == 200) {
            console.log("res",res)
            this.setState({
                qaIncidents: res.data?.view?.NMQALLogs,
                // totalItems:res.data.view.totalItems,
                qaIncidentsLoaded: true
            },() => {
                if (this.viewContentRef.current) {
                    this.viewContentRef.current.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                }
            }
             )
        
     } 
    }
    selectedRows(data){
        let batchArray = this.state.batchArray
        batchArray.push(data)
        console.log("batch",batchArray)

        this.setState({
            batchArray 
        })
        // let qaIncidents = this.state.qaIncidents
        // qaIncidents.filter((value) => value.lr_added == true)
        
        // for (let index = 0; index < data.length; index++) {
        //     batchArray = data.lr_no;
            
        // }
    }

  
    async getEmployees(){

        const userId = await localStorageService.getItem('userInfo').id

        let getAsignedEmployee = await EmployeeServices.getEmployees({
            // employee_id: userId,
            type: ['MSD SCO','MSD SCO Supply','MSD SCO QA'],
            // issuance_type: 'SCO' 
        })
        if (getAsignedEmployee.status == 200) {
            this.setState({
                // loaded: true,
                empData: getAsignedEmployee.data.view.data
            })

            console.log(this.state.empData);
        }
    }

    async loadAllItems(search) {
        // let params = { "search": search }
            let data = {
            search: search
        }
        //   let filterData = this.state.filterData
        // this.setState({ loaded: false })
        //   let params = { limit: 10000, page: 0 }
        // let filterData = this.state.filterData
        let res = await InventoryService.fetchAllItems(data)
        console.log('all Items', res.data.view.data)

        if (res.status == 200) {
            this.setState({ sr_no: res.data.view.data })
        }
        //   console.log('items', this.state.left)
    }

    render() {
        const { classes } = this.props
        return (
            <LoonsCard>
            <MainContainer>
                
                {/* <CardTitle title="Log Wise" /> */}

                <Grid item lg={12} className=" w-full mt-2">
                        <ValidatorForm
                            className="pt-2"
                            ref={'outer-form'}
                            onSubmit={() => this.LoadData()}
                            onError={() => null}
                        >
                            <Grid container spacing={1} className="flex">
                                <Grid
                                   className=" w-full"
                                   item
                                   lg={3}
                                   md={3}
                                   sm={12}
                                   xs={12}
                    
                                >
                                    <SubTitle title="SR No" />
                                    <Autocomplete
                                        disableClearable
                                className="w-full"
                                // value={this.state.hsco.sr_no}
                                // options={this.state.sr_no}
                                options={this.state.sr_no}
                                onChange={(e, value) => {
                                    if (null != value) {
                                        let filterData = this.state.filterData;
                                        filterData.item_id = value.id;
                                        console.log('SR no',filterData)
                                        this.setState({ 
                                            filterData,
                                            // srNo:true
                                        })
                                        // let formData = this.state.formData;
                                        // formData.sr_no = value;
                                       
                                    } 
                                    // else {
                                    //     let filterData = this.state.filterData;
                                    //     filterData.sr_no = null;
                                    //     this.setState({ filterData,
                                    //         srNo:false
                                    //     })
                                    // }
                                }}
                                getOptionLabel={(option) =>
                                   option.sr_no !== '' ? option.sr_no+'-'+option.long_description :null
                                    // let hsco =  this.state.hsco
                                    // if ( this.state.sr_no !== '' ) {
                                       
                                    // }
                                    // else{
                                    //    hsco.sr_no
                                    // }
                                    
                                    // this.state.hsco.sr_no === '' ? option.sr_no+'-'+option.long_description:this.state.hsco.sr_no
                                }
                                renderInput={(params) => (
                                    <TextValidator
                                        {...params}
                                        placeholder="Type more than 4 letters"
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        onChange={(e) => {
                                            console.log("as", e.target.value)
                                            if (e.target.value.length > 4) {
                                                this.loadAllItems(e.target.value)
                                                // let hsco =this.state.hsco
                                                // hsco.sr_no = e.target.value

                                            //     this.setState({
                                            //         hsco,
                                            //        srNo:false
                                            //    })
                                            }
                                        }}
                                    />
                                )}
                            />
                            </Grid>

                                <Grid
                                    className=" w-full"
                                    item
                                    lg={3}
                                    md={3}
                                    sm={12}
                                    xs={12}
                                >
                                    <SubTitle title="Status" />
                                    <Autocomplete
                                        disableClearable
                                                className="w-full"
                                                options={
                                                    appConst.qa_nmqal_status
                                                }
                                                onChange={(e, value) => {
                                                    if (null != value) {
                                                        let filterData = this.state.filterData
                                                        filterData.status = value.label
    
                                                        this.setState(
                                                            {
                                                                filterData
                                                            }
                                                        )
                                                    }
                                                    
                                                }}
                                                getOptionLabel={(option) =>
                                                    option.label
                                                }
                                                // validators={[
                                                //     'required',
                                                // ]}
                                                // errorMessages={[
                                                //     'this field is required',
                                                // ]}
                                                renderInput={(params) => (
                                                    <TextValidator
                                                        {...params}
                                                        placeholder="Type more than 3 letters"
                                                        //variant="outlined"
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        // value={
                                                        //     this.state
                                                        //         .formData
                                                        //         .donor_name
                                                        // }
                                                        
                                                        // validators={[
                                                        //     'required',
                                                        // ]}
                                                        // errorMessages={[
                                                        //     'this field is required',
                                                        // ]}
                                                    />
                                                )}
                                            />
                                </Grid>


                                <Grid
                                    className=" w-full"
                                    item
                                    lg={3}
                                    md={3}
                                    sm={12}
                                    xs={12}
                                >
                                    <SubTitle title="Reported Date From" />
                        <DatePicker
                            className="w-full"
                            placeholder="Reported Date From"
                            value={
                               this.state.filterData.from
                            }
                            // views={['year']}
                            // inputFormat="yyyy"
                            // format="yyyy"
                            onChange={(date) => {
                                let filterData = this.state.filterData
                                filterData.from = dateParse(date)
                                this.setState({
                                    filterData,
                                })
                            }}
                        />
                                </Grid>

                                <Grid
                                    className=" w-full"
                                    item
                                    lg={3}
                                    md={3}
                                    sm={12}
                                    xs={12}
                                >
                                    <SubTitle title="Reported Date to" />
                                    <DatePicker
                            className="w-full"
                            placeholder="Reported Date to"
                            value={
                               this.state.filterData.to
                            }
                            // views={['year']}
                            // inputFormat="yyyy"
                            // format="yyyy"
                            onChange={(date) => {
                                let filterData = this.state.filterData
                                filterData.to = dateParse(date)
                                this.setState({
                                    filterData,
                                })
                            }}
                        />
                                </Grid>

                                {/* <Grid
                                    className=" w-full flex-end mt-1"
                                    item
                                    lg={2}
                                    md={2}
                                    sm={12}
                                    xs={12}
                                >
                                    <Button
                                        className="mt-5 flex-end"
                                        progress={false}
                                        // onClick={() => {
                                        //     window.open('/estimation/all-estimation-items');
                                        // }}
                                        color="primary" style={{ fontWeight: 'bold', marginTop: -3 }}
                                        type="submit"
                                        scrollToTop={true}
                                        startIcon="search"
                                    >
                                        <span className="capitalize">Filter</span>
                                    </Button>
                                </Grid> */}



                            </Grid> 
                            <Grid container spacing={2}>
                            <Grid
                                className=" w-full"
                                item
                                lg={3}
                                md={3}
                                sm={12}
                                xs={12}
                            >
                                <SubTitle title="Search" />
                                <TextValidator
                                    className="w-full"
                                    placeholder="Search"
                                    //variant="outlined"
                                    fullWidth="fullWidth"
                                    variant="outlined"
                                    size="small"
                                    value={this.state.filterData.search}
                                    onChange={(e, value) => {
                                        let formData = this.state.filterData
                                        formData.search = e.target.value
                                        this.setState({ formData })
                                       
                                    }}
                                    /* validators={[
                                                'required',
                                                ]}
                                                errorMessages={[
                                                'this field is required',
                                                ]} */
                                    InputProps={{}}
                                    /*  validators={['required']}
                            errorMessages={[
                             'this field is required',
                            ]} */
                                />
                            </Grid>

                            <Grid
                                className=" w-full"
                                item
                                lg={3}
                                md={3}
                                sm={12}
                                xs={12}
                            >
                                <Button
                                    className="mt-6 mr-2"
                                    progress={false}
                                    type="submit"
                                    scrollToTop={false}
                                    startIcon="save"
                                    //onClick={this.handleChange}
                                >
                                    <span className="capitalize">
                                        Search
                                    </span>
                                </Button>
                                <Button
                                    className="mt-6 mr-2"
                                    progress={false}
                                    scrollToTop={false}
                                    // startIcon=""
                                    onClick={() => {
                                        window.location.reload()
                                    }}
                                >
                                    <span className="capitalize">
                                        Clear
                                    </span>
                                </Button>
                            </Grid>
                        </Grid>

                        </ValidatorForm>
                    </Grid>

                    <Grid className=" w-full" spacing={1} style={{ marginTop: 20, backgroundColor: 'red' }}>
                        <Paper elevation={0} square
                            style={{ backgroundColor: '#E6F6FE', border: '1px solid #DEECF3', height: 40 }}>
                            <Grid item lg={12} className=" w-full mt-2">
                                <Grid container spacing={1} className="flex">
                                    <Grid className="flex"
                                        item
                                        lg={12}
                                        md={12}
                                        sm={12}
                                        xs={12}
                                        spacing={2}
                                        justify="space-between"
                                        style={{ marginLeft: 10, paddingLeft: 30, paddingRight: 50 }}>

                                        <SubTitle title={`Total Items to be approved: ${this.state.totalItems}`} />
                                        <SubTitle title={`Pending: ${this.state.pending}`} />
                                    </Grid>
                                </Grid>
                            </Grid>
                       
                    </Paper>
                </Grid>

                <ValidatorForm>
                    {/* Table Section */}
                    <Grid container="container" className="mt-3 pb-5">
                        <Grid item="item" lg={12} md={12} sm={12} xs={12}>
                            {this.state.loading ? (
                                        <LoonsTable
                                        //title={"All Aptitute Tests"}
                                        id={'allAptitute'}
                                        data={this.state.data}
                                        columns={this.state.columns}
                                        options={{
                                            filter: false,
                                            filterType:'textField',
                                            responsive: 'standard',
                                            pagination: true,
                                            serverSide: true,
                                            count: this.state.totalItems,
                                            rowsPerPage: 10,
                                            page: this.state.filterData.page,
                                            onTableChange: (
                                                action,
                                                tableState
                                            ) => {
                                                console.log(
                                                    action,
                                                    tableState
                                                )
                                                switch (action) {
                                                    case 'changePage':
                                                        this.setPage(
                                                            tableState.page
                                                        )
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
                        ) : (
                                //loading effect
                                <Grid className="justify-center text-center w-full pt-12">
                                    <CircularProgress size={30} />
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                    {this.state.qaIncidentsLoaded &&
                    <Grid  item="item" lg={12} md={12} sm={12} xs={12}>
                    {this.state.qaIncidentsLoaded ? (
                    <div id='viewContent' ref={this.viewContentRef}>
                        <LoonsTable
                            id={"npdrug"}
                            data={this.state.qaIncidents}
                            columns={this.state.batchTable_coloums}
                            options={{
                                pagination: false,
                                serverSide: true,
                                count: this.state.totalItems,
                                rowsPerPage: 5,
                                page: this.state.page,
                                rowsPerPageOptions: [5,10,15,20,30,50,100],
                                selectableRows:true,
                                onTableChange: (action, tableSate) => {
                                    console.log("tableState",action)
                                    console.log("tableState2",tableSate)
                                    switch(action){
                                        case 'rowSelectionChange':
                                            let temp = []
                                            let selectedRows = tableSate.selectedRows.data
                                            console.log("selected",selectedRows)
                                            selectedRows.map((x)=>{
                                                // console.log(selectedRows)
                                                temp.push(this.state.data[x.dataIndex])
                                            })
                                            console.log("selectedRows",temp)
                                            this.setState({selectedRows : temp})
                                            break;
                                        case 'changePage':
                                            // this.setState({page:tableSate.page},()=>{
                                            //     this.showTableData()
                                            // })
                                            // console.log('page',this.state.page);
                                            break;
                                            case 'changeRowsPerPage':
                                                this.setState({
                                                    rowsPerPage:tableSate.rowsPerPage,
                                                    page:0,
                                                },()=>{
                                                    // this.showTableData()
                                                })
                                            break;
                                        default:
                                            console.log('action not handled');
                                    }
                                }
                            
                            }}
                        ></LoonsTable>
                        <Grid container spacing={2}>
                        <Grid
                            item
                            xs={12}
                            sm={12}
                            md={4}
                            lg={4}
                            // className="p-8"
                        > 
                            <SubTitle title="Remark" />
                            <TextValidator
                                                className="w-full"
                                                placeholder="Remark"
                                                
                                                name="Remark"
                                                InputLabelProps={{
                                                    shrink: false,
                                                }}
                                                value={
                                                    this.state.formData
                                                        .remarks
                                                }
                                                type="text"
                                                multiline
                                                rows={3}
                                                variant="outlined"
                                                size="small"
                                                onChange={(e) => {
                                                    this.setState({
                                                        formData: {
                                                            ...this
                                                                .state
                                                                .formData,
                                                                remarks:
                                                                e.target
                                                                    .value,
                                                        },
                                                    })
                                                }}
                                                validators={[
                                                    'required',
                                                ]}
                                                errorMessages={[
                                                    'This field is required',
                                                ]}
                                            />
                       

                        </Grid>
                            <Grid item className="mt-4">
                            {/* <Button
                            className="mt-6 mb-2"
                            progress={false}
                            disabled={this.state.changeTab}
                            // type="submit"
                            scrollToTop={true}
                            startIcon="save"
                            onClick={() => this.approve()}
                        >
                            <span className="capitalize">
                                Generate Circular
                            </span>
                        </Button>  */}
                         <MSDReport data={this.state.qaIncidents}/>
                            </Grid>


                    </Grid>

                    </div>
                                                    ) : (
                                //loading effect
                                <Grid className="justify-center text-center w-full pt-12">
                                    <CircularProgress size={30} />
                                </Grid>
                            )}
                        </Grid>
                    }
                </ValidatorForm>
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
           </MainContainer >

           <Dialog fullScreen maxWidth="lg " open={this.state.printLoad} onClose={() => { this.setState({ printLoad: false }) }}  >
                    <MuiDialogTitle disableTypography className={classes.Dialogroot}>
                        <CardTitle title="Circular Report" />
                        <IconButton aria-label="close" className={classes.closeButton}
                            onClick={() => {
                                this.setState({
                                    printLoad: false

                                })
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </MuiDialogTitle>
                    <MainContainer>

                        <Grid container>
 
                            <PrintHandleBar buttonTitle={"Print"} content={this.state.printData} title="Circular Report"></PrintHandleBar>

                        </Grid>


                    </MainContainer>
                </Dialog>

            </LoonsCard>

            
        )
    }
}

export default withStyles(styleSheet)(QACurrentRequests)