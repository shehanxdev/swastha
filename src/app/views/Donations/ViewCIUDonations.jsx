import React, { Component, Fragment } from "react";
import MainContainer from "../../components/LoonsLabComponents/MainContainer";
import CardTitle from "../../components/LoonsLabComponents/CardTitle";
import LoonsCard from "../../components/LoonsLabComponents/LoonsCard";
import {CircularProgress, Divider, Grid, Icon, IconButton, InputAdornment, Tooltip, Typography } from "@material-ui/core";
import { ValidatorForm,  TextValidator} from "react-material-ui-form-validator";
import {  Button,DatePicker,LoonsTable } from "app/components/LoonsLabComponents";
import SubTitle from "../../components/LoonsLabComponents/SubTitle";
import Paper from '@material-ui/core/Paper';  
import { Autocomplete } from "@mui/material";
import DetailedViewNonDrug from "./DetailedViewNonDrug";
import DetailedViewDrug from "./DetailedViewDrug";
import { Dialog } from "@mui/material";
import CloseIcon from '@material-ui/icons/Close';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import DonarService from '../../services/DonarService'

// tabs, tab
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';


import VisibilityIcon from '@material-ui/icons/Visibility'
import InventoryService from 'app/services/InventoryService'
import { dateParse } from "utils";
import * as appConst from '../../../appconst'


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

class ViewCIUDonations extends Component {

    constructor(props){
        super(props)
        this.state = {
            activeTabIndex: 0,
            detailedViewNonDrugView: false,
            detailedViewDrugView: false,
            classes: styleSheet,
            loading: true,
            totalItems: 0,
            formData: {
                // reg_no: '',
                sr_no: '',
                name: '',
                donor_name: '',
                donor_country: '',
                delivery_date: '',
                approved_date: '',
            },
            // reg_no: [],
            sr_no:[],
            allDonorData:[],
            // totalItemsToBeApproved: 0,
            filterData: {
                limit: 20,
                // page: 0,
                // delivery_date: null,
                // donor_name: '',
                // donor_country: '',
                // description: '',
                // reg_no: '',
                sr_no: '',
                name: '',
                // delivery_person: '',
                // 'reg_no[0]': ['updatedAt', 'DESC'],
                'sr_no[0]': ['updatedAt', 'DESC'],
            },
            data:[],        //{'sr_no':'2'}
            columns: [
                // {
                //     name: 'ids', // field name in the row object
                //     label: 'Invoice No', // column title that will be shown in table
                //     options: {
                //         filter: true,
                //         display: false,
                //         width: 10
                //     }
                // },
                // {
                //     name: 'reg_no', // field name in the row object
                //     label: 'Register No', // column title that will be shown in table
                //     options: {
                //         filter: true,
                //         display: true,
                //         width: 10,
                //         customBodyRender: (value, tableMeta, updateValue) => {
                //             return this.state.data[tableMeta.rowIndex]?.reg_no
                //         }
                //     }
                // },
                {
                    name: 'sr_no', // field name in the row object
                    label: 'SR No', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return this.state.data[tableMeta.rowIndex]?.itemdata?.sr_no
                        }
                    }
                },
                {
                    name: 'name', // field name in the row object
                    label: 'Item Name', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return this.state.data[tableMeta.rowIndex]?.name
                        }
                    }
                },
                {
                    name: 'total_quantity', // field name in the row object
                    label: 'Total Quantity', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return this.state.data[tableMeta.rowIndex]?.total_quantity
                        }
                    }
                },
                // {
                //     name: 'description', // field name in the row object
                //     label: 'Description', // column title that will be shown in table
                //     options: {
                //         filter: true,
                //         display: true,
                //         width: 10
                //     }
                // },
                // {
                //     name: 'delivery_date', // field name in the row object
                //     label: 'Delivery Date', // column title that will be shown in table
                //     options: {
                //         filter: true,
                //         display: true,
                //         width: 10
                //     }
                // },
                // {
                //     name: 'delivery_person', // field name in the row object
                //     label: 'Delivery Person', // column title that will be shown in table
                //     options: {
                //         filter: true,
                //         display: true,
                //         width: 10
                //     }
                // },
                {
                    name: "status",
                    label: "Status",
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            // let id = this.state.data[dataIndex]?.id
                            // let donation_id =this.state.data[dataIndex]?.donation_id
                            return (
                                <Grid className="flex items-center">
                                    {/* <Tooltip title="Edit">
                                        <IconButton>
                                            <Button color="primary"> */}
                                                <p>{this.state.data[dataIndex]?.status}</p>
                                                {/* </Button>
                                        </IconButton>
                                    </Tooltip> */}
                                    {/* <IconButton
                                        onClick={() => {
                                            window.location.href = `/donation/ciu-view-donation-item/${id}/${donation_id}`
                                        }}
                                        className="px-2"
                                        size="small"
                                        aria-label="View Item"
                                    >
                                        <VisibilityIcon />
                                    </IconButton> */}
                                </Grid>
                            );
                        }

                    }
                },
                {
                    name: "action",
                    label: "Action",
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let id = this.state.data[dataIndex]?.id
                            let donation_id =this.state.data[dataIndex]?.donation_id
                            return (
                                <Grid className="flex items-center">
                                    {/* <Tooltip title="Edit">
                                        <IconButton>
                                            <Button color="primary"> */}
                                                {/* <p>{this.state.data[dataIndex]?.status}</p> */}
                                                {/* </Button>
                                        </IconButton>
                                    </Tooltip> */}
                                    <IconButton
                                        onClick={() => {
                                            window.location.href = `/donation/ciu-view-donation-item/${id}/${donation_id}`
                                        }}
                                        className="px-2"
                                        size="small"
                                        aria-label="View Item"
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                </Grid>
                            );
                        }

                    }
                },
            ], 
            // totalItemsToBeApproved: 0,
            pending: 0,
        }
    }
    componentDidMount() {
        let donar_id =this.props.match.params.donar_id
        let id = this.props.match.params.id
        console.log('NOTE ID', id)
        console.log('NOTE ID2', donar_id)
        this.LoadData()
    }
    async LoadData() {
        this.setState({ loaded: false })
        console.log("State 1:", this.state.data)
        let filterData = this.state.filterData
        // filterData.donation_id = this.props.match.params.id
        filterData.status = 'Submitted to CIU'
        // let id = this.props.match.params.id
        let res = await DonarService.getDonationItem(filterData)
             if (res.status == 200) {
            this.setState({
                data: res.data.view.data,
                totalItems:res.data.view.totalItems,
                loaded: true
            }, () => console.log('resdata', res))
        }  
      }
      async loadAllItems(search) {
        // let params = { "search": search }
        let data = {
          search: search
      }
      let filterData = this.state.filterData
      // this.setState({ loaded: false })
      let params = { limit: 10000, page: 0 }
      // let filterData = this.state.filterData
      let res = await InventoryService.fetchAllItems(data)
      console.log('all Items', res.data.view.data)

      if (res.status == 200) {
          this.setState({ sr_no: res.data.view.data })
      }
    //   console.log('items', this.state.left)
  }
  async loadDonors(search) {
    console.log('donor',search)
    // let employeeFilterData = this.state.employeeFilterData
    let data = {
        search: search
    }
    this.setState({ loaded: false })
    let res = await DonarService.getDonors(data)
    console.log('all pharmacist', res.data.view.data)
    if (200 == res.status) {
        this.setState({
            allDonorData: res.data.view.data,
            loaded: true,
        })
    }
}

// // edited
// async setTab(newValue) {

//     let filterData = this.state.filterData;
//     if (newValue == 0) {
//         filterData.status = 'Pending to CIU' // status for pending
//         this.setState({ filterData, activeTabIndex: 0 }, () => { this.setpage(0) }) //setTab for pending
//     }
//     else if (newValue == 1) {
//         filterData.status = 'Submitted to CIU' // status for submitted
//         this.setState({ filterData, activeTabIndex: 1 }, () => { this.setpage(1) }) //setTab for submitted
//     }
//     else if (newValue == 2) {
//         filterData.status = 'Rejected to CIU' // status for rejected
//         this.setState({ filterData, activeTabIndex: 2 }, () => { this.setpage(2) }) //setTab for rejected
//     }
//     // else if (newValue == 3) {
        
//     //     this.setState({ filterData, activeTabIndex: 3 }, () => { this.setpage(3) }) //setTab for all donations
//     // } 
//     else {
//         filterData.status = 'All Donations to CIU' // status for all donations
//         this.setState({ filterData, activeTabIndex: 3 }, () => { this.setpage(3) }) //setTab for all donations
//         }
//     }






    render(){
        // const { classes } = this.props
        return(
            <MainContainer>
                <LoonsCard>
                    <CardTitle title="View Donations Items CIU" />

                    {/* <Tabs
                        value={this.state.activeTabIndex}
                        onChange={this.handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        aria-label="full width tabs example">
                        <Tab label="Pending" />  
                        <Tab label="Submited" />  
                        <Tab label="Rejected" />  
                        <Tab label="All Donations" />
                    </Tabs> */}

                    <Grid item lg={12} className=" w-full mt-2">
                            <ValidatorForm
                                className="pt-2"
                                ref={'outer-form'}
                                onSubmit={() => this.LoadData()}
                                onError={() => null}
                            >
                                <Grid container spacing={1} className="flex">
                                
                                {/* <Grid
                                        className=" w-full"
                                        item
                                        lg={2}
                                        md={2}
                                        sm={12}
                                        xs={12}
                                    >
                                        <SubTitle title="Register No" />
                                        <Autocomplete
                                        disableClearable
                                    className="w-full"
                                    // value={this.state.hsco.reg_no}
                                    // options={this.state.reg_no}
                                    options={this.state.reg_no}
                                    onChange={(e, value) => {
                                        if (null != value) {
                                            let filterData = this.state.filterData;
                                            filterData.reg_no = value.id;
                                            console.log('Reg no',filterData)
                                            this.setState({ 
                                                filterData,
                                                // srNo:true
                                            })
                                            // let formData = this.state.formData;
                                            // formData.reg_no = value;
                                           
                                        } 
                                        // else {
                                        //     let filterData = this.state.filterData;
                                        //     filterData.reg_no = null;
                                        //     this.setState({ filterData,
                                        //         srNo:false
                                        //     })
                                        // }
                                    }}
                                    getOptionLabel={(option) =>
                                       option.reg_no !== '' ? option.reg_no+'-'+option.long_description :null
                                        // let hsco =  this.state.hsco
                                        // if ( this.state.reg_no !== '' ) {
                                           
                                        // }
                                        // else{
                                        //    hsco.reg_no
                                        // }
                                        
                                        // this.state.hsco.reg_no === '' ? option.reg_no+'-'+option.long_description:this.state.hsco.reg_no
                                    }
                                    renderInput={(params) => (
                                        <TextValidator
                                            {...params}
                                            placeholder="Please type register No"
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            onChange={(e) => {
                                                console.log("as", e.target.value)
                                                if (e.target.value.length > 4) {
                                                    this.loadAllItems(e.target.value)
                                                    // let hsco =this.state.hsco
                                                    // hsco.reg_no = e.target.value

                                                //     this.setState({
                                                //         hsco,
                                                //        srNo:false
                                                //    })
                                                }
                                            }}
                                        />
                                    )}
                                />
                                    </Grid> */}

                                    <Grid
                                        className=" w-full"
                                        item
                                        lg={2}
                                        md={2}
                                        sm={12}
                                        xs={12}
                                    >
                                        <SubTitle title="SR No" />
                                        <TextValidator
                                        variant="outlined"
                                        size="small"
                                    className="w-full"
                                    placeholder="Type SR No"
                                    // value={this.state.hsco.sr_no}
                                    // options={this.state.sr_no}
                                    // options={this.state.sr_no}
                                    onChange={(e) => {
                                        // if (null != value) {
                                            let filterData = this.state.filterData;
                                            filterData.sr_no = e.target.value;
                                            console.log('SR no',filterData)
                                            this.setState({ 
                                                filterData,
                                                // srNo:true
                                            })
                                            // let formData = this.state.formData;
                                            // formData.sr_no = value;
                                           
                                        // } 
                                        // else {
                                        //     let filterData = this.state.filterData;
                                        //     filterData.sr_no = null;
                                        //     this.setState({ filterData,
                                        //         srNo:false
                                        //     })
                                        // }
                                    }}
                                    // getOptionLabel={(option) =>
                                    //    option.sr_no !== '' ? option.sr_no+' - '+option.long_description :null
                                        // let hsco =  this.state.hsco
                                        // if ( this.state.sr_no !== '' ) {
                                           
                                        // }
                                        // else{
                                        //    hsco.sr_no
                                        // }
                                        
                                        // this.state.hsco.sr_no === '' ? option.sr_no+'-'+option.long_description:this.state.hsco.sr_no
                                    // }
                                    // renderInput={(params) => (
                                    //     <TextValidator
                                    //         {...params}
                                    //         placeholder="Please type SR No"
                                    //         fullWidth
                                    //         variant="outlined"
                                    //         size="small"
                                    //         onChange={(e) => {
                                    //             console.log("as", e.target.value)
                                    //             if (e.target.value.length > 4) {
                                    //                 this.loadAllItems(e.target.value)
                                    //                 // let hsco =this.state.hsco
                                    //                 // hsco.sr_no = e.target.value

                                    //             //     this.setState({
                                    //             //         hsco,
                                    //             //        srNo:false
                                    //             //    })
                                    //             }
                                    //         }}
                                    //     />
                                    // )}
                                />
                                    </Grid>

                                    <Grid
                                        className=" w-full"
                                        item
                                        lg={2}
                                        md={2}
                                        sm={12}
                                        xs={12}
                                    >
                                        <SubTitle title="Item Name" />
                                        <TextValidator
                                        variant="outlined"
                                        size="small"
                                    className="w-full"
                                    placeholder="Type more than 3 letters"
                                                    // options={
                                                    //     this.state.allDonorData
                                                    // }
                                                    onChange={(e) => {
                                                        // if (null != value) {
                                                            let filterData = this.state.filterData
                                                            filterData.name = e.target.value
                                                            // filterData.donor_id = value.id
                                                            this.setState(
                                                                {
                                                                    filterData
                                                                }
                                                            )
                                                        // }
                                                        // else{
                                                        //     let filterData = this.state.filterData
                                                        //     filterData.donor_name =null
                                                        //     this.setState({
                                                        //         filterData
                                                        //     })
                                                        // }
                                                    }}
                                                    // getOptionLabel={(option) =>
                                                    //     option.name
                                                    // }
                                                    // validators={[
                                                    //     'required',
                                                    // ]}
                                                    // errorMessages={[
                                                    //     'this field is required',
                                                    // ]}
                                                    // renderInput={(params) => (
                                                    //     <TextValidator
                                                    //         {...params}
                                                    //         placeholder="Type more than 3 letters"
                                                    //         //variant="outlined"
                                                    //         fullWidth
                                                    //         variant="outlined"
                                                    //         size="small"
                                                    //         // value={
                                                    //         //     this.state
                                                    //         //         .formData
                                                    //         //         .donor_name
                                                    //         // }
                                                    //         onChange={(e) => {
                                                    //             if(e.target.value.length > 3){
                                                    //                 this.loadDonors(e.target.value)
                                                    //             }
                                                              
                                                    //         }
                                                    //         }
                                                    //         // validators={[
                                                    //         //     'required',
                                                    //         // ]}
                                                    //         // errorMessages={[
                                                    //         //     'this field is required',
                                                    //         // ]}
                                                    //     />
                                                    // )}
                                                />
                                    </Grid>

                                    {/* <Grid
                                        className=" w-full"
                                        item
                                        lg={2}
                                        md={2}
                                        sm={12}
                                        xs={12}
                                    >
                                        <SubTitle title="Donor Country" />
                                        <Autocomplete
                                        disableClearable
                                            className="w-full"
                                            options={appConst.Country_list}
                                            clearOnBlur={true}
                                            clearText="clear"
                                            onChange={(e, value) => {
                                                if (null != value) {
                                                    let filterData = this.state.filterData;
                                                    filterData.donor_country = value.name;
                                                    this.setState({ filterData })
                                                }
                                            }} 
                                            
                                            getOptionLabel={(option) =>
                                                option.name ? option.name : ''
                                            }
                                            renderInput={(params) => (
                                                <TextValidator
                                                    {...params}
                                                    placeholder="Please choose"
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    // value={this.state.filterData.vehicle_type}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid
                                        className=" w-full"
                                        item
                                        lg={2}
                                        md={2}
                                        sm={12}
                                        xs={12}
                                    >
                                        <SubTitle title="Delivery Date" />
                            <DatePicker
                                className="w-full"
                                placeholder="Delivery Date"
                                value={
                                   this.state.filterData.delivery_date
                                }
                                // views={['year']}
                                // inputFormat="yyyy"
                                // format="yyyy"
                                onChange={(date) => {
                                    let filterData = this.state.filterData
                                    filterData.delivery_date = dateParse(date)
                                    this.setState({
                                        filterData,
                                    })
                                }}
                            />
                                    </Grid>

                                    <Grid
                                        className=" w-full"
                                        item
                                        lg={2}
                                        md={2}
                                        sm={12}
                                        xs={12}
                                    >
                                        <SubTitle title="Approved Date" />
                                        <DatePicker
                                className="w-full"
                                placeholder="Approved Date"
                                value={
                                   this.state.filterData.approved_date
                                }
                                // views={['year']}
                                // inputFormat="yyyy"
                                // format="yyyy"
                                onChange={(date) => {
                                    let filterData = this.state.filterData
                                    filterData.approved_date = dateParse(date)
                                    this.setState({
                                        filterData,
                                    })
                                }}
                            />
                                    </Grid> */}

                                    <Grid
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
                                    </Grid>
                                </Grid>   
                            </ValidatorForm>
                        </Grid>

                        {/* <Grid className=" w-full" spacing={1} style={{ marginTop: 20, backgroundColor: 'red' }}>
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
                        </Grid> */}

                    <ValidatorForm>
                        {/* Table Section */}
                        <Grid container="container" className="mt-3 pb-5">
                                <Grid item="item" lg={12} md={12} sm={12} xs={12}>
                                    {
                                        this.state.loading
                                            ? <LoonsTable
                                            //title={"All Aptitute Tests"}
                                            id={'allAptitute'} data={this.state.data} columns={this.state.columns} options={{
                                                pagination: true,
                                                serverSide: true,
                                                count: this.state.totalItems,
                                                rowsPerPage: 10,
                                                page: this.state.page,
                                                onTableChange: (action, tableState) => {
                                                    console.log(action, tableState)
                                                    switch (action) {
                                                        case 'changePage':
                                                            // this.setPage(     tableState.page )
                                                            break
                                                        case 'sort':
                                                            //this.sort(tableState.page, tableState.sortOrder);
                                                            break
                                                        default:
                                                            console.log('action not handled.')
                                                    }
                                                }
                                            }}></LoonsTable>
                                            : (
                                                //loading effect
                                                <Grid className="justify-center text-center w-full pt-12">
                                                    <CircularProgress size={30} />
                                                </Grid>  
                                            )
                                    }
                            </Grid>
                        </Grid>
                    </ValidatorForm>

                    {/* <Button aria-label="close" className={styleSheet.Dialogroot} onClick={() => { this.setState({ detailedViewNonDrugView: true }) }}> 
                        Detailed View of Non-Drug
                    </Button> */}

                    <Dialog maxWidth="lg " open={this.state.detailedViewNonDrugView} >

                    <MuiDialogTitle disableTypography className={styleSheet.Dialogroot}>
                        <CardTitle title="Detailed View of the Donation" />

                        <IconButton aria-label="close" className={styleSheet.Dialogroot} onClick={() => { this.setState({ detailedViewNonDrugView: false }) }}> 
                            <CloseIcon />
                        </IconButton>

                    </MuiDialogTitle>



                    <div className="w-full h-full px-5 py-5">
                        <DetailedViewNonDrug/>
                    </div>
                </Dialog>

                {/* <Button aria-label="close" className={styleSheet.Dialogroot} onClick={() => { this.setState({ detailedViewDrugView: true }) }}> 
                        Detailed View of Drug
                    </Button> */}

                    <Dialog maxWidth="lg " open={this.state.detailedViewDrugView} >

                    <MuiDialogTitle disableTypography className={styleSheet.Dialogroot}>
                        <CardTitle title="Detailed View of the Donation" />

                        <IconButton aria-label="close" className={styleSheet.Dialogroot} onClick={() => { this.setState({ detailedViewDrugView: false }) }}> 
                            <CloseIcon />
                        </IconButton>

                    </MuiDialogTitle>



                    <div className="w-full h-full px-5 py-5">
                        <DetailedViewDrug/>
                    </div>
                </Dialog>  

                </LoonsCard>
            </MainContainer>
        )
    }
}

export default ViewCIUDonations