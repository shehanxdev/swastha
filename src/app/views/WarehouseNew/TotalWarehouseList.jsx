import React, { Component, Fragment } from "react";
import { Button, CardTitle, LoonsCard, LoonsTable, MainContainer, SubTitle } from "../../components/LoonsLabComponents";
import {
    CircularProgress, Grid, Link, Tooltip, IconButton, InputAdornment, Typography,
    Dialog,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import EditIcon from '@material-ui/icons/Edit';
import { TextValidator } from 'react-material-ui-form-validator'
import { ValidatorForm } from 'app/components/LoonsLabComponents'
import ConsignmentService from "../../services/ConsignmentService";
import moment from "moment";
import * as appConst from '../../../appconst'
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import WarehouseServices from "app/services/WarehouseServices";
import SearchIcon from '@material-ui/icons/Search';
import localStorageService from "app/services/localStorageService";
import ApartmentIcon from '@material-ui/icons/Apartment';
import VisibilityIcon from '@mui/icons-material/Visibility';


class TotalWarehouseList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: true,
            totalItems: 0,

            selected_warehouse: null,
            owner_id: null,
            dialog_for_select_warehouse: false,
            all_warehouse_loaded: [],

            ref_no: '',
            sr_no: '',
            batch_id: '',
            wharf_ref_no: '',
            mas_remark: '',

            formData: {
                ref_no: '',
                sr_no: '',
                batch_id: '',
                wharf_ref_no: '',
                mas_remark: '',
                items: []
            },

            filterData: {
                limit: 20,
                page: 0,
                // search: '',
                load_type: 'warehouse_summary',
                /* ref_no: '',
                sr_no: '',
                batch_id: '',
                mas_remark: '',
                wharf_ref_no: '', */
            },
            alltypes: [],
            allStid: [],
            sampleData: [],

            sampleItemData: [],

            data: [],
            dialogBoxHandler: true,
            columns: [
                {
                    name: 'Action', // field name in the row object
                    label: 'Action', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        customBodyRenderLite: (dataIndex) => {
                            let id = this.state.data[dataIndex].id;
                            return (
                                <Grid className="flex items-center">
                                    <Tooltip title="View">
                                        <IconButton
                                            onClick={() => {
                                                window.location.href = `/distribution/editwarehousetab/${id}`

                                            }}>
                                            <VisibilityIcon color="primary" />
                                            
                                        </IconButton>
                                    </Tooltip>
                                    {/* <Grid className="px-2">
                                          <Tooltip title="View">
                                              <IconButton
                                                  onClick={() => {
                                                      window.location.href = `/consignments/view-consignment/${id}`
                                                  }}>
                                                  <VisibilityIcon color='primary' />
                                              </IconButton>
                                          </Tooltip>
                                      </Grid> */}
                                </Grid>
                            );
                        }
                    },
                },
                // {
                //     name: 'department_id', // field name in the row object
                //     label: 'Department ID', // column title that will be shown in table
                //     options: {
                //         filter: false,
                //         display: true,
                //         customBodyRenderLite: (dataIndex) => {
                //             let data = this.state.data[dataIndex].Pharmacy_drugs_store.Department.id
                //             return <p>{data}</p>
                //         },
                //     },
                // },
                {
                    name: 'department_name', // field name in the row object
                    label: 'Department Name', // column title that will be shown in table
                    options: {
                        filter: false,
                        display: true,
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex].Pharmacy_drugs_store.Department.name
                            return <p>{data}</p>
                        },
                    },
                },
                {
                    name: 'store_id', // field name in the row object
                    label: 'Store ID', // column title that will be shown in table
                    options: {
                        filter: false,
                        display: true,
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex].Pharmacy_drugs_store.store_id
                            return <p>{data}</p>
                        },
                    },
                },
                {
                    name: 'store_name', // field name in the row object
                    label: 'Store Name', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex].name
                            return <p>{data}</p>
                        },
                    },
                },
                {
                    name: 'store_type', // field name in the row object
                    label: 'Store Typew', // column title that will be shown in table
                    options: {
                        filter: false,
                        display: true,
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex].type
                            return <p>{data}</p>
                        },
                    },
                },
                {
                    name: 'usage', // field name in the row object
                    label: 'Usage', // column title that will be shown in table
                    options: {
                        filter: false,
                        display: true,
                        customBodyRenderLite: (dataIndex) => {
                            let error = 0
                            let data = this.state.data[dataIndex]?.Usage[0]?.total_volume
                            if (data === null || data === ' ' || this.state.data[dataIndex]?.Usage.length === 0) {
                                return <p>{error}</p>
                            } else {
                                return <p>{Math.floor(data)}</p>
                            }

                        },
                    },
                },

                {
                    name: 'total_volume', // field name in the row object
                    label: 'Total Volume', // column title that will be shown in table
                    options: {
                        filter: false,
                        display: true,
                        customBodyRenderLite: (dataIndex) => {
                            let error = 0
                            let data = this.state.data[dataIndex].VolumeDetails[0]?.total_volume
                            if (data === null || data === ' ' || data.length === 0) {
                                return <p>{error}</p>
                            } else {
                                return <p>{data}</p>
                            }
                        },
                    },
                },
                {
                    name: 'available_volume', // field name in the row object
                    label: 'Available Volume', // column title that will be shown in table
                    options: {
                        filter: false,
                        display: true,
                        customBodyRenderLite: (dataIndex) => {
                            let error = 0
                            let data = parseInt(this.state.data[dataIndex].VolumeDetails[0]?.total_volume) - (parseInt(this.state.data[dataIndex]?.AllocatedDetails[0]?.allocated_volume) + parseInt(this.state.data[dataIndex]?.Usage[0]?.total_volume))
                            console.log('data2',data)
                            if (this.state.data[dataIndex]?.AllocatedDetails.length === 0 && this.state.data[dataIndex]?.Usage.length === 0 || data === null || this.state.data[dataIndex]?.AllocatedDetails[0]?.allocated_volume == null) {
                                return <div style={{ background: '#90EE90' }}>{this.state.data[dataIndex].VolumeDetails[0]?.total_volume}</div>
                            }
                            // else if(this.state.data[dataIndex]?.AllocatedDetails[0]?.allocated_volume == null || this.state.data[dataIndex]?.Usage[0]?.total_volume == null ){
                            //     return  <div style={{ background: '#90EE90'}}>{this.state.data[dataIndex].VolumeDetails[0]?.total_volume}</div>  
                            // }
                            // else if(this.state.data[dataIndex]?.AllocatedDetails.length === 0  && this.state.data[dataIndex]?.Usage.length  === 0 && this.state.data[dataIndex].VolumeDetails[0].total_volume === null){
                            //     return  <div style={{ background: '#FFCCCB'}}>{error}</div>  
                            // }
                            else if (data === null || data === ' ' || isNaN(data)) {
                                return <div style={{ background: '#FFCCCB' }}>{error}</div>
                            } else if (data <= 10000) {
                                return <div style={{ background: '#FF0000' }}>{data}</div>
                                // return <Dialog style={{ padding: '20px', }} className="py-4 px-2 text-center" fullWidth maxWidth="sm" open={this.state.dialogBoxHandler} >
                                //             <Typography variant="h6" className="font-semibold">Available Volume is too low!</Typography>
                                //             <Button
                                //                 color="primary"
                                //                 onClick={() => { this.setState({ dialogBoxHandler: false }) }}
                                //             >
                                //                 <span className="mx-4 capitalize">
                                //                         Okay
                                //                     </span>
                                //             </Button>
                                //         </Dialog> 
                            } else {
                                return <div style={{ background: '#90EE90' }}>{data}</div>
                            }

                        },
                    },
                },
                // {
                //     name: 'address', // field name in the row object
                //     label: 'Address', // column title that will be shown in table
                //     options: {
                //         filter: false,
                //         display: true
                //     },
                // },
                {
                    name: 'map_location', // field name in the row object
                    label: 'Location', // column title that will be shown in table
                    options: {
                        filter: false,
                        display: true,
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.data[dataIndex].Pharmacy_drugs_store.location
                            return <p>{data}</p>
                        },
                    },
                },

            ],

            alert: false,
            message: "",
            severity: 'success',
        }
    }

    // async fetchConsignmentSamples() {
    //     let samples = await ConsignmentService.fetchConsignmentSamples();
    //     if (samples.status === 200) {
    //         this.setState({
    //             sampleData: samples.data.view.data
    //         })
    //     }
    // }

    // async fetchConsignmentSamplesItem() {
    //     let samples = await ConsignmentService.fetchConsignmentSamples();
    //     if (samples.status === 200) {
    //         this.setState({
    //             sampleItemData: samples.data.view.data.item
    //         })
    //     }
    // }

    dialogBoxCloseHandler() {
        let dialogBoxHandler = this.state.dialogBoxHandler
        dialogBoxHandler = false
        this.setState(
            dialogBoxHandler,
        )
    }

    // Load data onto table
    async loadData() {
        this.setState({ loaded: false })
        let warehouse_id = null;
        let filterData = this.state.filterData

        let warehouse = this.state.all_warehouse_loaded.map(x => x.id)

        let userInfo = await localStorageService.getItem('userInfo')
        /*   if (userInfo.roles.includes('Counter Pharmacist') || userInfo.roles.includes('Pharmacist') || userInfo.roles.includes('Admin Pharmacist')) {
              warehouse_id = await localStorageService.getItem('Selected_Warehouse')
              filterData.warehouse_id = warehouse_id.warehouse.id;
              this.setState({filterData})
          } else {
              warehouse_id = await localStorageService.getItem('login_user_pharmacy_drugs_stores')
              console.log("warehouse id", warehouse_id)
              filterData.warehouse_id = warehouse_id[0].Pharmacy_drugs_store.id
              this.setState({filterData})
          } */

        if (!userInfo.roles.includes("MSD AD")) {
            filterData.warehouse_id = warehouse;
            this.setState({ filterData })
        }




        var ownerID = await localStorageService.getItem('owner_id');

        let res = await WarehouseServices.getAllWarehousewithOwner(filterData, ownerID)
        console.log("Warehouse", res)
        if (res.status == 200) {
            this.setState(
                {
                    loaded: true,
                    data: res.data.view.data,
                    totalPages: res.data.view.totalPages,
                    totalItems: res.data.view.totalItems,
                },
                () => {
                    this.render()
                }
            )
        }
    }

    handleFilterSubmit = (val) => {
        this.loadData()
    }

    onSubmit = () => {
        this.handleFilterSubmit({
            ref_no: this.state.ref_no,
            sr_no: this.state.sr_no,
            batch_id: this.state.batch_id,
            wharf_ref_no: this.state.wharf_ref_no,
        })
    }

    async setPage(page) {
        //Change paginations
        let filterData = this.state.filterData
        filterData.page = page
        this.setState(
            {
                filterData,
            },
            () => {
                this.loadData()
            }
        )
    }
    async loadGroups() {
        let params = { limit: 99999, page: 0 }
        const res = await ConsignmentService.getOrderDeliveryVehicleTypes(params)

        let loadVehicleTypes = this.state.alltypes
        if (res.status == 200) {
            var loadedData = res.data.view.data
            loadedData.forEach(element => {
                let loadType = {}
                loadType.name = element.name
                loadType.id = element.id
                loadType.status = element.status
                loadVehicleTypes.push(loadType)
            });
        }
        else {
            this.setState({
                alert: true,
                severity: 'error',
                message: res.data.error,
            })
        };
        this.setState({
            alltypes: loadVehicleTypes
        })
        console.log("Store Name", this.state.alltypes)
    }

    async loadWarehouses() {
        this.setState({ Loaded: false })
        var user = await localStorageService.getItem('userInfo');
        console.log('user', user)
        var id = user.id;
        var all_pharmacy_dummy = [];
        var selected_warehouse_cache = await localStorageService.getItem('Selected_Warehouse');
        if (!selected_warehouse_cache) {
            // this.setState({ dialog_for_select_warehouse: true })
        }
        else {
            // this.state.genOrder.created_by = id
            // this.state.genOrder.warehouse_id = selected_warehouse_cache.id
            // this.state.getCartItems.warehouse_id = selected_warehouse_cache.id
            // this.state.suggestedWareHouses.warehouse_id = selected_warehouse_cache.id
            // this.state.formData.owner_id = selected_warehouse_cache.owner_id
            this.setState({
                owner_id: selected_warehouse_cache.owner_id,
                selected_warehouse: selected_warehouse_cache.id,
                dialog_for_select_warehouse: false,
                warehouseSelectDone: true
            }, () => {
                // this.loadData();
            })
            console.log(this.state.selected_warehouse)
        }
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
            this.setState({ all_warehouse_loaded: all_pharmacy_dummy, Loaded: true }, () => { this.loadData() })
        }
    }


    componentDidMount() {
        //  this.fetchConsignmentSamples()
        this.loadWarehouses()
        // this.loadData()
        this.loadGroups()
        //this.fetchConsignmentSamplesItem()
    }

    render() {
        return (
            <Fragment>
                <MainContainer>
                    <LoonsCard>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6" className="font-semibold"> Warehouse List </Typography>
                            {/* <Button
                                color='primary'
                                onClick={() => {
                                    this.setState({ dialog_for_select_warehouse: true, Loaded: false })
                                }}>
                                <ApartmentIcon />
                               Chanage Warehouse
                            </Button> */}
                        </div>

                        <Grid item lg={12} className=" w-full mt-2">
                            <ValidatorForm
                                className="pt-2"
                                ref={'outer-form'}
                                onSubmit={() => this.onSubmit()}
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
                                        <SubTitle title="Store Name" />
                                        <Autocomplete
                                        disableClearable
                                            className="w-full"
                                            options={this.state.ç}
                                            clearOnBlur={true}
                                            clearText="clear"
                                            onChange={(e, value) => {
                                                if (null != value) {
                                                    let filterData = this.state.filterData;
                                                    filterData.vehicle_type = value.id;
                                                    this.setState({ filterData })
                                                }
                                            }}
                                            // value={{
                                            //     name: this.state.filterData.vehicle_type ? (this.state.alltypes.find((obj) => obj.id == this.state.filterData.vehicle_type).name) : null,
                                            //     id: this.state.filterData.vehicle_type
                                            // }}
                                            // getOptionLabel={(option) => option.name}
                                            renderInput={(params) => (
                                                <TextValidator
                                                    {...params}
                                                    placeholder="Please choose"
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    value={this.state.filterData.vehicle_type}
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
                                        <SubTitle title="Store Type" />
                                        <Autocomplete
                                        disableClearable
                                            className="w-full"
                                            options={appConst.phamacistsTypes.sort((a,b)=> (a.label?.localeCompare(b.label)))}
                                            clearOnBlur={true}
                                            clearText="clear"
                                            onChange={(e, value) => {
                                                if (null != value) {
                                                    let filterData = this.state.filterData;
                                                    filterData.vehicle_type = value.id;
                                                    this.setState({ filterData })
                                                }
                                            }}
                                            // value={{
                                            //     name: this.state.filterData.vehicle_type ? (this.state.alltypes.find((obj) => obj.id == this.state.filterData.vehicle_type).name) : null,
                                            //     id: this.state.filterData.vehicle_type
                                            // }}
                                            getOptionLabel={(option) =>
                                                option.label ? option.label : ''
                                            }
                                            renderInput={(params) => (
                                                <TextValidator
                                                    {...params}
                                                    placeholder="Please choose"
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    value={this.state.filterData.vehicle_type}
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
                                        <SubTitle title="Search" />
                                        <TextValidator className='w-full' placeholder="Enter Store ID/Name" fullWidth="fullWidth" variant="outlined" size="small"
                                            //value={this.state.formData.search} 
                                            onChange={(e, value) => {
                                                let filterData = this.state.filterData
                                                if (e.target.value != '') {
                                                    filterData.search = e.target.value;
                                                } else {
                                                    filterData.search = null
                                                }
                                                this.setState({ filterData })
                                                console.log("form dat", this.state.filterData)
                                            }} onKeyPress={(e) => {
                                                if (e.key == "Enter") {
                                                    this.loadData()
                                                }
                                            }}

                                            /* validators={[
                                            'required',
                                            ]}
                                            errorMessages={[
                                            'this field is required',
                                            ]} */
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <SearchIcon></SearchIcon>
                                                    </InputAdornment>
                                                )
                                            }} />
                                    </Grid>
                                    <ValidatorForm
                                        className="pt-2"
                                        onSubmit={() => this.loadData()}
                                        onError={() => null}
                                    >
                                        <Grid container spacing={1}>
                                            <Grid
                                                className="w-full"
                                                item
                                                lg={4}
                                                md={4}
                                                sm={12}
                                                xs={12}
                                            >
                                                <Button
                                                    className="mt-5"
                                                    progress={false}
                                                    type="submit"
                                                    scrollToTop={true}
                                                    startIcon="search"
                                                // onClick={this.onSubmit}
                                                >
                                                    <span className="capitalize">
                                                        Search
                                                    </span>
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </ValidatorForm>



                                </Grid>
                                {/* <Grid  item
                                        lg={4}
                                        md={2}
                                        sm={12}
                                        xs={12}
                                        justify="flex-start">
                                    <Button
                                        className="mt-6 justify-end"
                                        color="primary"
                                        // progress={this.state.btnProgress}
                                        startIcon="note_add"
                                        // type="submit"
                                        onClick={() => {
                                            window.location.href = '/msd_warehouse/createwarehouse'
                                           
                                        }}
                                        scrollToTop={true}
                                    >
                                        <span className="capitalize">
                                            Create New Warehouse
                                        </span>
                                    </Button>
                                </Grid> */}


                            </ValidatorForm>
                        </Grid>

                        {/*Table*/}
                        <Grid lg={12} className=" w-full mt-2" spacing={2} style={{ marginTop: 20 }}>

                            {
                                this.state.loaded ?
                                    <div className="pt-0">
                                        <LoonsTable
                                            id={"DEFAULT_USER"}
                                            data={this.state.data}
                                            columns={this.state.columns}
                                            options={{
                                                pagination: true,
                                                serverSide: true,
                                                count: this.state.totalItems,
                                                rowsPerPage: 20,
                                                page: this.state.filterData.page,

                                                onTableChange: (action, tableState) => {
                                                    switch (action) {
                                                        case 'changePage':
                                                            this.setPage(tableState.page)
                                                            break;
                                                        case 'sort':
                                                            break;
                                                        default:
                                                            console.log('action not handled.');
                                                    }
                                                }

                                            }
                                            }
                                        >
                                        </LoonsTable>
                                    </div>
                                    :
                                    <Grid className="justify-center text-center w-full pt-12">
                                        <CircularProgress size={30} />
                                    </Grid>
                            }
                        </Grid>
                    </LoonsCard>
                </MainContainer>

                <Dialog fullWidth maxWidth="sm" open={this.state.dialog_for_select_warehouse} >

                    <MuiDialogTitle disableTypography>
                        <CardTitle title="Select Your Warehouse" />
                    </MuiDialogTitle>



                    <div className="w-full h-full px-5 py-5">
                        <ValidatorForm
                            onError={() => null}
                            className="w-full"
                        >
                            <Autocomplete
                                        disableClearable
                                className="w-full"
                                options={this.state.all_warehouse_loaded}
                                onChange={(e, value) => {
                                    if (value != null) {
                                        this.state.owner_id = value.owner_id
                                        this.setState({ owner_id: value.owner_id, selected_warehouse: value.id, dialog_for_select_warehouse: false, Loaded: true }, () => { this.loadData() })
                                        localStorageService.setItem('Selected_Warehouse', value);
                                        // this.loadData()
                                    }
                                }}
                                value={{
                                    name: this.state.selected_warehouse ? (this.state.all_warehouse_loaded.filter((obj) => obj.id == this.state.selected_warehouse).name) : null,
                                    id: this.state.selected_warehouse
                                }}
                                getOptionLabel={(option) => option.name != null ? option.name + " - " + option.main_or_personal : null}
                                renderInput={(params) => (
                                    <TextValidator
                                        {...params}
                                        placeholder="Select Your Warehouse"
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            />

                        </ValidatorForm>
                    </div>
                </Dialog>
            </Fragment>
        )
    }
}

export default TotalWarehouseList
