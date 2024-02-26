import {
    Badge,
    CircularProgress,
    Dialog,
    Divider,
    Grid,
    InputAdornment,
    TextField,
    Tooltip,
} from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import TableContainer from "@material-ui/core/TableContainer";
import Typography from "@material-ui/core/Typography";
import { green, yellow } from '@material-ui/core/colors';
import { withStyles } from '@material-ui/core/styles';
import CancelIcon from '@material-ui/icons/Cancel';
import CloseIcon from '@material-ui/icons/Close';
import ListIcon from '@material-ui/icons/List';
import SearchIcon from '@material-ui/icons/Search';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import ViewListIcon from '@material-ui/icons/ViewList';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { Alert, Autocomplete } from '@material-ui/lab';
import FeedIcon from '@mui/icons-material/Feed';

import {
    Button,
    CardTitle,
    DatePicker,
    LoonsCard,
    LoonsSnackbar,
    LoonsTable,
    MainContainer,
    SubTitle
} from 'app/components/LoonsLabComponents';
import LoonsButton from "app/components/LoonsLabComponents/Button";
import WarehouseServices from 'app/services//WarehouseServices';
import DistributionCenterServices from 'app/services/DistributionCenterServices';
import PharmacyOrderService from 'app/services/PharmacyOrderService';
import CategoryService from 'app/services/datasetupServices/CategoryService';
import ClassDataSetupService from 'app/services/datasetupServices/ClassDataSetupService';
import GroupSetupService from 'app/services/datasetupServices/GroupSetupService';
import localStorageService from "app/services/localStorageService";
import 'date-fns';
import ReactEcharts from 'echarts-for-react';
import moment from 'moment';
import React, { Component, Fragment } from 'react';
import { TextValidator } from 'react-material-ui-form-validator'
import { ValidatorForm } from 'app/components/LoonsLabComponents';
import { dateTimeParse, roundDecimal } from "utils";
import ItemsBatchView from './../../orders/ItemsBatchView';
import LinearProgress from '@material-ui/core/LinearProgress';

import Popover from '@mui/material/Popover';

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
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
})

class MDS_Create_Orders extends Component {
    constructor(props) {
        super(props)
        this.state = {
            processing_in_generate: false,
            //snackbar
            alert: false,
            message: '',
            severity: 'success',
            totalItems2: null,
            instituteConsumptionData: {
                to: null,
                from: null,
                search: null,
            },
            loadingSuggestedWarehoues: false,
            prescriptionDrugAssign: [],
            showItemBatch: false,
            item_warehouse_id: null,
            selected_item_id: null,
            batchTotal: [],
            updateQty: true,
            itemTotalQty: 0,
            selected_warehouse: '0',
            owner_id: null,
            dialog_for_select_warehouse: false,
            all_warehouse_loaded: [],
            owner_id: null,
            addtocart: null,
            cartStatus: [
                {
                    buttonState: false
                }
            ],

            tempCartStatus: [],

            isConvertedOrderUom: false,
            ConvertedOrderUomQty: null,
            selectedItem: 0,
            loaded: false,
            selectedInstitute: 0,
            instituteConsumption: false,
            instituteIndividual: false,
            lowStockWarning: false,
            suggestedWareHous: false,
            expiredStockWarning: false,
            orderExistWarning: false,
            individualView: false,
            orderDeleteWarning: false,
            convert: false,
            convertQty: null,

            mesUnit: null,
            disUnit: null,

            orderID: null,
            medDetails: {
                itemName: "Panadol",
                drugStore: "Tangalle"
            },
            consumpEstimate: null,
            orderQty: null,
            activeStep: 1,
            data: [],
            showAddRemark: false,
            remarkAddedIndex: 0,

            openHover: false,

            instituteData: [
                {
                    routeid: 123456,
                    insCode: 'INS0001',
                    institute: 'LoonsLab',
                    address: 'WTC,Colombo',
                    consumption: 1000
                }
            ],
            instituteColumns: [
                {
                    name: 'routeid',
                    label: 'Route ID',
                    options: {}
                },
                {
                    name: 'insCode',
                    label: 'Institute Code',
                    options: {

                    }
                }, {
                    name: 'institute',
                    label: 'Institute',
                    options: {

                    }
                },
                {
                    name: 'address',
                    label: 'Address',
                    options: {}
                },
                {
                    name: 'consumption',
                    label: 'Consumption',
                    options: {

                    }
                }, {
                    name: 'actions',
                    label: 'Actions',
                    options: {
                        customBodyRenderLite: (dataIndex) => (
                            <Tooltip title="View">
                                <IconButton size="small" aria-label="view"
                                    onClick={() => {
                                        this.state.selectedInstitute = dataIndex
                                        this.setState({
                                            instituteIndividual: true
                                        })
                                    }}
                                >
                                    <VisibilityIcon />
                                </IconButton>
                            </Tooltip>
                        )
                    }
                },

            ],
            myStockData: [],
            myStockCols: [
                // {     name: 'invoice',     label: 'Invoice No',     options: {} },
                {
                    name: 'batch',
                    label: 'Batch No',
                    options: {
                        customBodyRender: (value, tableMeta, updateValue) => {
                            if (this.state.myStockData[tableMeta.rowIndex]) {
                                // return "N/A"
                                return this
                                    .state
                                    .myStockData[tableMeta.rowIndex]
                                    .ItemSnapBatch
                                    .batch_no
                            }

                        }
                    }
                }, {
                    name: 'exp',
                    label: 'Exp Date',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            if (this.state.myStockData[dataIndex]) {
                                let data = this
                                    .state
                                    .myStockData[dataIndex]
                                    .ItemSnapBatch
                                    .exd;
                                if (data) {
                                    return <p>{dateTimeParse(data)}</p>
                                } else {
                                    return "N/A"
                                }
                            }
                        }
                    }
                },
                // {     name: 'uom',     label: 'UOM',     options: {} },
                {
                    name: 'minPack',
                    label: 'Min Pack Size',
                    options: {
                        customBodyRender: (value, tableMeta, updateValue) => {

                            if (this.state.batchTotal[tableMeta.rowIndex] == undefined) { this.state.batchTotal.push(parseInt(this.state.myStockData[tableMeta.rowIndex].quantity)) }

                            if (this.state.myStockData[tableMeta.rowIndex]) {
                                // return "N/A"
                                return this
                                    .state
                                    .myStockData[tableMeta.rowIndex]
                                    .ItemSnapBatch
                                    .pack_size
                            }
                        }
                    }
                }, {
                    name: 'quantity',
                    label: 'Stock Qty',
                    options: {
                        customBodyRender: (value, tableMeta, updateValue) => {

                            let data = this.state.myStockData[tableMeta.rowIndex]?.quantity

                            if (this.state.isConvertedOrderUom) {
                                return roundDecimal(data * this.state.ConvertedOrderUomQty, 2) + ' ' + this.state.disUnit
                            } else {
                                return data
                            }

                        }
                    }
                },
                {
                    name: 'quantity2',
                    label: 'Serviceable Qty',
                    options: {
                        customBodyRender: (value, tableMeta, updateValue) => {

                            let data = this.state.myStockData[tableMeta.rowIndex]?.quantity2

                            if (this.state.isConvertedOrderUom) {
                                return roundDecimal(data * this.state.ConvertedOrderUomQty, 2) + ' ' + this.state.disUnit
                            } else {
                                return data
                            }

                        }
                    }
                },

            ],
            consumption: [
                // {     name: 'invoice',     label: 'Invoice No',     options: {} },
                // {
                //     name: 'batch',
                //     label: 'Batch No',
                //     options: {
                //         customBodyRender: (value, tableMeta, updateValue) => {
                //             if (this.state.myStockData[tableMeta.rowIndex]) {
                //                 // return "N/A"
                //                 return this
                //                 .state
                //                 .myStockData[tableMeta.rowIndex]
                //                 .ItemSnapBatch
                //                 .batch_no
                //             }

                //         }
                //     }
                // },
                {
                    name: 'exp',
                    label: 'Order From',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            if (this.state.orderItemData[dataIndex]) {
                                let data = this.state.orderItemData[dataIndex].OrderExchange?.fromStore.name
                                return <p>{data}</p>

                            }
                        }
                    }
                },
                // {     name: 'uom',     label: 'UOM',     options: {} },
                {
                    name: 'request_quantity',
                    label: 'Stock Qty',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.orderItemData[dataIndex]?.request_quantity
                            if (this.state.isConvertedOrderUom) {
                                if (this.state.orderItemData[dataIndex]) {

                                    return <p>{roundDecimal(data * this.state.ConvertedOrderUomQty, 2) + ' ' + this.state.disUnit}</p>
                                }
                            } else {
                                if (this.state.orderItemData[dataIndex]) {
                                    return <p>{data}</p>
                                }
                            }

                        }
                    }
                },
                //  {
                //     name: 'quantity2',
                //     label: 'Reservable Qty',
                //     options: {}
                // }, 

            ],

            columns: [
                {
                    name: 'sr_no', // field name in the row object
                    label: 'SR Number', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        width: 10,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            if (this.state.data[tableMeta.rowIndex]?.sr_no == null) {
                                return 'N/A'
                            } else {
                                return this.state.data[tableMeta.rowIndex]?.sr_no
                            }
                        }
                    }
                }, {
                    name: 'item_name',
                    label: 'Item Name',
                    options: {
                        customBodyRender: (value, tableMeta, updateValue) => {
                            if (this.state.data[tableMeta.rowIndex]?.item_name == null) {
                                return 'N/A'
                            } else {
                                return this.state.data[tableMeta.rowIndex]?.item_name
                            }
                        }
                        // filter: true,
                    },
                    width: 50
                }, {
                    name: 'ven',
                    label: 'Ven',
                    options: {
                        display: false,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            if (this.state.data[tableMeta.rowIndex]?.ven == null) {
                                return 'N/A'
                            } else {
                                return this.state.data[tableMeta.rowIndex]?.ven
                            }
                        }
                        // filter: true,
                    }
                }, {
                    name: 'drug_store_name',
                    label: 'Drug Store',
                    options: {
                        customBodyRender: (value, tableMeta, updateValue) => {
                            if (this.state.data[tableMeta.rowIndex]?.drug_store_name == null) {
                                return 'N/A'
                            } else {
                                return this.state.data[tableMeta.rowIndex]?.drug_store_name
                            }
                        }
                        // filter: true,
                    }
                }, {
                    name: 'store_quantity',
                    label: 'Drug Store Stock Quantity',
                    options: {
                        display: false,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            if (this.state.data[tableMeta.rowIndex]?.store_quantity == null) {
                                return 'N/A'
                            } else {
                                return parseInt(this.state.data[tableMeta.rowIndex]?.store_quantity)
                            }
                        }
                        // filter: true,
                    }
                }, {
                    name: 'physical_quantity',
                    label: 'Drug Store Physical Qty',
                    options: {
                        customBodyRender: (value, tableMeta, updateValue) => {
                            if (this.state.data[tableMeta.rowIndex]?.converted_order_uom === 'EU') {
                                if (this.state.data[tableMeta.rowIndex]?.store_quantity == null) {
                                    return 'N/A'
                                } else {
                                    return this.state.data[tableMeta.rowIndex]?.store_quantity * this.state.data[tableMeta.rowIndex]?.item_unit_size + ' ' + this.state.data[tableMeta.rowIndex]?.display_unit
                                }
                            } else {
                                if (this.state.data[tableMeta.rowIndex]?.store_quantity == null) {
                                    return 'N/A'
                                } else {
                                    return this.state.data[tableMeta.rowIndex]?.store_quantity
                                }
                            }
                            console.log('rezzzzz', this.state.data[tableMeta.rowIndex]?.store_quantity)

                        }
                        // filter: true,
                    }
                },
                {
                    name: 'store_recervable_quantity',
                    label: 'Drug Store Available Qty',
                    options: {
                        customBodyRender: (value, tableMeta, updateValue) => {
                            if (this.state.data[tableMeta.rowIndex]?.converted_order_uom === 'EU') {
                                if (this.state.data[tableMeta.rowIndex]?.store_recervable_quantity == null) {
                                    return 'N/A'
                                } else {
                                    return (this.state.data[tableMeta.rowIndex]?.store_recervable_quantity * this.state.data[tableMeta.rowIndex]?.item_unit_size) + ' ' + this.state.data[tableMeta.rowIndex]?.display_unit
                                }
                            } else {
                                if (this.state.data[tableMeta.rowIndex]?.store_recervable_quantity == null) {
                                    return 'N/A'
                                } else {
                                    return this.state.data[tableMeta.rowIndex]?.store_recervable_quantity
                                }
                            }

                        }
                        // filter: true,
                    }
                }, {
                    name: 'my_stock_quantity',
                    label: 'My Stock Qty',
                    options: {
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {

                            if (this.state.data[tableMeta.rowIndex]?.converted_order_uom === 'EU') {
                                if (this.state.data[tableMeta.rowIndex]?.my_stock_quantity == null) {
                                    return 'N/A'
                                } else {
                                    return parseInt(this.state.data[tableMeta.rowIndex]?.my_stock_quantity * this.state.data[tableMeta.rowIndex]?.item_unit_size) + ' ' + this.state.data[tableMeta.rowIndex]?.display_unit
                                }
                            } else {
                                if (this.state.data[tableMeta.rowIndex]?.my_stock_quantity == null) {
                                    return 'N/A'
                                } else {
                                    return parseInt(this.state.data[tableMeta.rowIndex]?.my_stock_quantity)
                                }
                            }

                        }
                    }
                },
                {
                    name: 'mystock_days',
                    label: 'My Store Stock Days',
                    options: {
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            if (this.state.data[tableMeta.rowIndex]?.mystock_days == null) {
                                return 'N/A'
                            } else {
                                return Math.ceil(this.state.data[tableMeta.rowIndex]?.mystock_days)
                            }
                        }
                    }
                },
                {
                    name: 'prescribable amount',
                    label: 'Prescribable Amount',
                    options: {
                        display: false,
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {

                            console.log("this.state.prescriptionDrugAssign", this.state.prescriptionDrugAssign)
                            let data = this.state.prescriptionDrugAssign.filter((item) => item.drug_id == this.state.data[tableMeta.rowIndex]?.item_id)

                            if (data.length == 0) {
                                return '0'
                            } else {
                                let qty = Number(data[0].total_quantity) * (this.state.data[tableMeta.rowIndex]?.OrderRequirement?.order_for) / 180
                                return roundDecimal(qty, 1)
                            }
                        }
                    }
                }
                , {
                    name: 'estimated_consumption',
                    label: 'System Estimated Consumption',
                    options: {
                        display: false,
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            let data = this.state.data[tableMeta.rowIndex]?.estimated_consumption / this.state.data[tableMeta.rowIndex]?.OrderRequirement?.order_for
                            if (data == 0 || data == null) {
                                return 0
                            } else {
                                //comment by roshan
                                /*  this.setState({
                                     estimated_consumption:data,
                                     tableRow:[tableMeta.rowIndex]
                                    
                                 }) */
                                return Math.ceil(data)
                            }
                        }

                        // customBodyRender: (value, tableMeta, updateValue) => {
                        //     if (tableMeta.rowData[8] == null) {
                        //         return 'N/A'
                        //     } else {
                        //         return tableMeta.rowData[8]
                        //     }
                        // }
                    }
                },/*  {
                    name: 'minimum_stock_level',
                    label: 'Reorder Level',
                    options: {
                        display: true,
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            console.log('reolevl', this.state.data[tableMeta.rowIndex])
                            // if (this.state.data[tableMeta.rowIndex]?.minimum_stock_level == null) {
                            //     return 'N/A'
                            // } else {
                            //     return parseInt(this.state.data[tableMeta.rowIndex]?.minimum_stock_level)
                            // }
                        }
                    }
                }, */
                {
                    name: 'minimum_stock_level',
                    label: 'Minimum Stock Level',
                    options: {
                        display: false,
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            if (this.state.data[tableMeta.rowIndex]?.minimum_stock_level == null) {
                                return 'N/A'
                            } else {
                                return parseInt(this.state.data[tableMeta.rowIndex]?.minimum_stock_level)
                            }
                        }
                    }
                }, {
                    name: 'on_order_amount',
                    label: 'On Order Qty',
                    options: {
                        display: false,
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            if (this.state.data[tableMeta.rowIndex]?.on_order_amount == null) {
                                return 'N/A'
                            } else {
                                return parseInt(this.state.data[tableMeta.rowIndex]?.on_order_amount)
                            }
                        }
                    }
                }, {
                    name: 'on_order_committed',
                    label: 'On Order (Allocated)',
                    options: {
                        display: false,
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            if (this.state.data[tableMeta.rowIndex]?.on_order_committed == null) {
                                return 'N/A'
                            } else {
                                return parseInt(this.state.data[tableMeta.rowIndex]?.on_order_committed)
                            }
                        }
                    }
                }, {
                    name: 'in_transit',
                    label: 'In Transit Qty',
                    options: {
                        display: false,
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            if (this.state.data[tableMeta.rowIndex]?.in_transit == null) {
                                return 'N/A'
                            } else {
                                return parseInt(this.state.data[tableMeta.rowIndex]?.in_transit)
                            }
                        }
                    }
                }, {
                    name: 'annual_estimated_quantity',
                    label: 'My Store Estimate (Annual)',
                    options: {
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            if (this.state.data[tableMeta.rowIndex]?.annual_estimated_quantity == null) {
                                return 'N/A'
                            } else {
                                return parseInt(this.state.data[tableMeta.rowIndex]?.annual_estimated_quantity)
                            }
                        }
                    }
                }, {
                    name: 'remaining_annual_estimated_quantity',
                    label: 'My Store Remain Annual Estimate Qty',
                    options: {
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            if (this.state.data[tableMeta.rowIndex]?.remaining_annual_estimated_quantity == null) {
                                return 'N/A'
                            } else {
                                return parseInt(this.state.data[tableMeta.rowIndex]?.remaining_annual_estimated_quantity)
                            }
                        }
                    }
                }, {
                    name: 'pack_size',
                    label: 'Minimum Pack Size',
                    options: {
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            console.log('cheking item det', this.state.data[tableMeta.rowIndex])
                            if (this.state.data[tableMeta.rowIndex]?.converted_order_uom === 'EU'){
                                if (this.state.data[tableMeta.rowIndex]?.item_unit_size == null) {
                                    return 'N/A'
                                } else {
                                    return roundDecimal(this.state.data[tableMeta.rowIndex]?.item_unit_size,0)
                                }
                            } else {
                                if (this.state.data[tableMeta.rowIndex]?.pack_size == null) {
                                    return 'N/A'
                                } else {
                                    return parseInt(this.state.data[tableMeta.rowIndex]?.pack_size)
                                }
                            }

                        }
                    }
                }, {
                    name: 'order_quantity',
                    label: 'Order Qty',
                    options: {
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return (
                                <>
                                    {(this.state.data[tableMeta.rowIndex]?.converted_order_uom === 'EU' && this.state?.cartStatus[tableMeta.rowIndex]?.order_quantity > 0) &&
                                        <p className='pt-1 pb-1 pl-5 pr-5' style={{ border: '1px solid #ffd600', backgroundColor: '#fff59d', borderRadius: '3px', textAlign: 'center' }}>{roundDecimal(this.state.cartStatus?.[tableMeta.rowIndex]?.temp_quantity / this.state.data[tableMeta.rowIndex]?.item_unit_size, 2) + ' ' + this.state.data[tableMeta.rowIndex]?.measuring_unit}</p>
                                    }
                                    <TextValidator
                                        id={'Hello' + this.state.data[tableMeta.rowIndex]?.rowIndex}
                                        defaultValue={value != null ? value : 0}
                                        className='w-full'
                                        variant="outlined"
                                        size="small"
                                        style={{ width: 160 }}
                                        InputProps={{
                                            endAdornment: (
                                                this.state.data[tableMeta.rowIndex]?.converted_order_uom === 'EU' ? (
                                                    <InputAdornment position="end" className='mr-1'>
                                                        {this.state.data[tableMeta.rowIndex]?.display_unit}
                                                    </InputAdornment>
                                                ) : null // Render nothing when the condition is not met
                                            )
                                        }}
                                        onChange={(e) => {

                                            let cartStatus = this.state.cartStatus;
                                            cartStatus[tableMeta.rowIndex].order_quantity = e.target.value
                                            cartStatus[tableMeta.rowIndex].temp_quantity = e.target.value

                                            // let tempStatus = this.state.tempCartStatus || [];
                                            // tempStatus[tableMeta.rowIndex].temp_quantity = e.target.value
                                            if (this.state.data[tableMeta.rowIndex]?.converted_order_uom === 'EU') {
                                                this.setState({ cartStatus, openHover: true, convert: true, convertQty: this.state.data[tableMeta.rowIndex]?.item_unit_size })
                                            } else {
                                                this.setState({ cartStatus, openHover: true, })
                                            }

                                        }}></TextValidator>
                                </>


                            )

                        }
                    }
                }, {
                    name: 'action',
                    label: 'Action',
                    options: {
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            this
                                .state
                                .cartStatus
                                .push({ sr_no: this.state.data[tableMeta.rowIndex]?.sr_no, buttonState: false, color: green[500], color2: yellow[600], tooltip: "Add to Cart", order_quantity: this.state.data[tableMeta.rowIndex]?.order_quantity })

                            /*          this
                                         .state
                                         .cartItems
                                         .find((item) => {
                                             if (item.id == this.state.data[tableMeta.rowIndex]?.id) {
                                                 this.state.cartStatus[tableMeta.rowIndex].buttonState = true
                                                 this.state.cartStatus[tableMeta.rowIndex].color = "grey"
                                                     this
                                                     .state
                                                     .cartStatus[tableMeta.rowIndex]
                                                     .color2 = "grey"
                                                 this
                                                     .state
                                                     .cartStatus[tableMeta.rowIndex]
                                                     .tooltip = "Added to Cart"
                                             }
                                         }) */

                            return (
                                <Grid className="flex items-center">
                                    <Tooltip
                                        title={this
                                            .state
                                            .cartStatus[tableMeta.rowIndex]
                                            .tooltip}>
                                        <IconButton
                                            disabled={this
                                                .state
                                                .cartStatus[tableMeta.rowIndex]
                                                .buttonState}
                                            className="px-2"
                                            onClick={() => {
                                                console.log("order qua", this.state.cartStatus[tableMeta.rowIndex].order_quantity)
                                                let medDetails = this.state.medDetails;
                                                let my_ownerId = localStorageService.getItem("owner_id")
                                                let suggestedWareHouses = this.state.suggestedWareHouses;
                                                let addSuggestedWareHouseCart = this.state.addSuggestedWareHouseCart;
                                                medDetails.itemName = this.state.data[tableMeta.rowIndex]?.item_name
                                                medDetails.drugStore = this.state.data[tableMeta.rowIndex]?.drug_store_name
                                                suggestedWareHouses.item_id = this.state.data[tableMeta.rowIndex]?.item_id
                                                addSuggestedWareHouseCart.order_item_id = this.state.data[tableMeta.rowIndex]?.id

                                                // prettier-ignore
                                                // this.state.addtocart = this.state.data[tableMeta.rowIndex]?.id
                                                //this.state.medDetails.itemName = tableMeta.item_name
                                                //this.state.medDetails.drugStore = tableMeta.drug_store_name
                                                // this.state.suggestedWareHouses.item_id = this.state.data[tableMeta.rowIndex]?.item_id
                                                // this.state.addSuggestedWareHouseCart.order_item_id = this.state.data[tableMeta.rowIndex]?.id
                                                let consumpEstimate = this.state.data[tableMeta.rowIndex]?.estimated_consumption / this.state.data[tableMeta.rowIndex]?.OrderRequirement?.order_for


                                                this.setState({
                                                    rows2: [],
                                                    selectedItem: tableMeta.rowIndex,
                                                    orderQty: this.state.cartStatus[tableMeta.rowIndex].order_quantity,
                                                    consumpEstimate: consumpEstimate,
                                                    addtocart: this.state.data[tableMeta.rowIndex]?.id,
                                                    medDetails: medDetails,
                                                    suggestedWareHouses: suggestedWareHouses,
                                                    addSuggestedWareHouseCart: addSuggestedWareHouseCart

                                                }, () => {
                                                    this.suggestedWareHouse()
                                                    if ((parseInt(this.state.cartStatus[tableMeta.rowIndex].order_quantity) > parseInt(this.state.data[tableMeta.rowIndex]?.remaining_annual_estimated_quantity)) && my_ownerId != this.state.data[tableMeta.rowIndex]?.default_warehouse_owner_id) {

                                                        this.setState({ showAddRemark: true, remarkAddedIndex: tableMeta.rowIndex })
                                                    } else {

                                                        this.addtocart()
                                                    }
                                                    /*   if (this.state.cartStatus[tableMeta.rowIndex].order_quantity <= 0) {
                                                          this.setState(
                                                              { alert: true, message: "You have not added a value", severity: 'error' }
                                                          )
                                                      } else {
                                                          if ((tableMeta.store_quantity != null) && (tableMeta.rowData[8] != null)) {
                                                              if (this.state.cartStatus[tableMeta.rowIndex].order_quantity > parseInt(tableMeta.store_quantity)) {
                                                                  this.setState({ lowStockWarning: true })
                                                              } else if (tableMeta.rowData[9] < 0) {
                                                                  this.setState({ expiredStockWarning: true })
                                                              } else {
                                                                  this.addtocart()
                                                              }
                                                          } else {
                                                              this.setState(
                                                                  { alert: true, message: "Some Values are not loaded to the database", severity: 'error' }
                                                              )
                                                          }
                                                      } */
                                                })

                                            }}
                                            size="small"
                                            aria-label="view">
                                            <ShoppingCartIcon
                                                style={{
                                                    color: this
                                                        .state
                                                        .cartStatus[tableMeta.rowIndex]
                                                        .color
                                                }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="View/Order From Other Institutions">
                                        <IconButton
                                            className="px-2"
                                            onClick={() => {
                                                let consumpEstimate = this.state.data[tableMeta.rowIndex]?.estimated_consumption / this.state.data[tableMeta.rowIndex]?.OrderRequirement?.order_for
                                                this.state.addSuggestedWareHouseCart.order_item_details = []

                                                if (this.state.data[tableMeta.rowIndex]?.converted_order_uom === 'EU') {
                                                    this.setState({
                                                        batchTotal: [],
                                                        myStockData: [],
                                                        rows2: [],
                                                        itemTotalQty: 0,
                                                        selectedItem: tableMeta.rowIndex,
                                                        selected_item_id: this.state.data[tableMeta.rowIndex]?.item_id,
                                                        orderQty: this.state.cartStatus[tableMeta.rowIndex].order_quantity,
                                                        consumpEstimate: consumpEstimate,
                                                        isConvertedOrderUom: true,
                                                        ConvertedOrderUomQty: this.state.data[tableMeta.rowIndex]?.item_unit_size,
                                                        mesUnit: this.state.data[tableMeta.rowIndex]?.measuring_unit,
                                                        disUnit: this.state.data[tableMeta.rowIndex]?.display_unit
                                                    }, () => {
                                                        this.getOrderItems()
                                                    })
                                                } else {
                                                    this.setState({
                                                        batchTotal: [],
                                                        myStockData: [],
                                                        rows2: [],
                                                        itemTotalQty: 0,
                                                        selectedItem: tableMeta.rowIndex,
                                                        selected_item_id: this.state.data[tableMeta.rowIndex]?.item_id,
                                                        orderQty: this.state.cartStatus[tableMeta.rowIndex].order_quantity,
                                                        consumpEstimate: consumpEstimate,
                                                        isConvertedOrderUom: false
                                                    }, () => {
                                                        this.getOrderItems()
                                                    })

                                                }
                                                // this.setState({
                                                //     batchTotal: [],
                                                //     myStockData: [],
                                                //     rows2: [],
                                                //     itemTotalQty: 0,
                                                //     selectedItem: tableMeta.rowIndex,
                                                //     selected_item_id: this.state.data[tableMeta.rowIndex]?.item_id,
                                                //     orderQty: this.state.cartStatus[tableMeta.rowIndex].order_quantity,
                                                //     consumpEstimate: consumpEstimate
                                                // })
                                                this.state.addtocart = this.state.data[tableMeta.rowIndex]?.id
                                                this.state.medDetails.itemName = this.state.data[tableMeta.rowIndex]?.item_name
                                                this.state.medDetails.drugStore = this.state.data[tableMeta.rowIndex]?.drug_store_name
                                                // this.state.consumpEstimate = consumpEstimate
                                                this.state.suggestedWareHouses.item_id = this.state.data[tableMeta.rowIndex]?.item_id
                                                this.state.addSuggestedWareHouseCart.order_item_id = this.state.data[tableMeta.rowIndex]?.id
                                                this.suggestedWareHouse()
                                                this.getBatchData()

                                                this.getOrderItemsTotal()
                                                this.setState({ individualView: true })

                                                console.log("data row 4", this.state.data[tableMeta.rowIndex]?.store_quantity)
                                                console.log("data row 8", consumpEstimate)

                                                if ((this.state.data[tableMeta.rowIndex]?.store_quantity != null) && (consumpEstimate != null)) {
                                                    if (this.state.data[tableMeta.rowIndex]?.store_quantity > tableMeta.consumpEstimate) {
                                                        if (this.state.cartStatus[tableMeta.rowIndex].buttonState != true) {
                                                            this.setState(
                                                                { alert: true, message: "You have not added a value", severity: 'error' }
                                                            )
                                                        }
                                                    } else if (this.state.data[tableMeta.rowIndex]?.minimum_stock_level < 1000) {
                                                        this.setState(
                                                            { message: "Expiring stocks in the Selected Warehouse", severity: 'error' }
                                                        )
                                                    }
                                                } else {
                                                    this.setState(
                                                        { message: "Some Values are not loaded to the database", severity: 'error' }
                                                    )
                                                }

                                                if (this.state.cartStatus[tableMeta.rowIndex].buttonState == true) {
                                                    this.setState({ orderQty: this.state.cartStatus[tableMeta.rowIndex].order_quantity })
                                                }
                                            }}
                                            size="small"
                                            aria-label="view">
                                            <VisibilityIcon
                                                style={{
                                                    color: yellow[600]
                                                }} />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="View Batches">
                                        <IconButton
                                            className="px-2"
                                            onClick={() => {
                                                this.setState({
                                                    selected_item_id: this.state.data[tableMeta.rowIndex]?.item_id,
                                                    item_warehouse_id: this.state.data[tableMeta.rowIndex]?.default_warehouse_id,
                                                    showItemBatch: true
                                                })
                                            }}
                                        >
                                            <ListIcon />
                                        </IconButton>
                                    </Tooltip>

                                    {/* add stock movement icon  */}
                                    <Tooltip title="Stock Movement">
                                        <IconButton
                                            onClick={() => {
                                                window.location = `/drugbalancing/checkStock/detailedview/${this.state.data[tableMeta.rowIndex]?.item_id}`

                                                // /${this.state.data[tableMeta.rowIndex]?.item_batch_id}
                                                // ?from=${this.state.filterData.from}
                                                // &to=${this.state.filterData.to}
                                                // &batch_id=${this.state.data[tableMeta.rowIndex]?.batch_id}
                                            }}
                                            className="px-2"
                                            size="small"
                                            aria-label="View Item Stocks"
                                        >
                                            <FeedIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                            )
                        }

                    }
                }
            ],

            estimated_consumption: null,
            // tableRow:0,
            alert: false,
            message: '',
            severity: 'success',
            patient_pic: null,
            selectedType: null,
            selectedDays: null,
            all_ven: [],
            all_item_class: [],
            all_item_category: [],
            all_item_group: [],
            all_days: [],
            selectedID: null,
            orderItemData: [],
            orderItemDataTot: [],
            isTableVisible: false,
            isTableVisiblePO: false,
            day_month: [
                {
                    id: 1,
                    name: "Days"
                }, {
                    id: 2,
                    name: "Months"
                }
            ],

            loading: false,
            formData3: {
                page: 0,
                limit: 10,
            },

            formData: {
                ven_id: null,
                class_id: null,
                category_id: null,
                group_id: null,
                item_id: null,
                description: null,
                store_quantity: null,
                lessStock: null,
                moreStock: null,
                page: 0,
                limit: 10,
                warehouse_id: null,
                search: null,
                // 'order[0]': [
                //     'updatedAt', 'DESC'
                // ],
                order: ['sr_no']
            },
            rows: [
                {
                    "storeName": "Distribution Center",
                    "dStoreID": 1,
                    "batch": "",
                    "reason": "New",
                    "stockQty": 4000,
                    "price": 3.99,
                    "batchDetails": [
                        {
                            "no": "1",
                            "invoiceNo": "TESTINVO1",
                            "batchNo": "TESTBatch1",
                            "expDate": "2020-01-01",
                            "stockQty": "2000"
                        }, {
                            "no": "2",
                            "invoiceNo": "TESTINVO2",
                            "batchNo": "TESTBatch2",
                            "expDate": "2020-01-01",
                            "stockQty": "2000"
                        }
                    ]
                }, {
                    "storeName": "Drug Store 1",
                    "dStoreID": 2,
                    "batch": "",
                    "reason": "New",
                    "stockQty": 4500,
                    "price": 3.99,
                    "batchDetails": [
                        {
                            "no": "23",
                            "invoiceNo": "TESTINVO3",
                            "batchNo": "TESTBatch3",
                            "expDate": "2020-01-01",
                            "stockQty": "2000"
                        }, {
                            "no": "4",
                            "invoiceNo": "TESTINVO4",
                            "batchNo": "TESTBatch4",
                            "expDate": "2020-01-01",
                            "stockQty": "2500"
                        }
                    ]
                }, {
                    "storeName": "Drug Store 2",
                    "dStoreID": 3,
                    "batch": "",
                    "reason": "New",
                    "stockQty": 6500,
                    "price": 3.99,
                    "batchDetails": [
                        {
                            "no": "5",
                            "invoiceNo": "TESTINVO5",
                            "batchNo": "TESTBatch5",
                            "expDate": "2020-01-01",
                            "stockQty": "2000"
                        }, {
                            "no": "6",
                            "invoiceNo": "TESTINVO6",
                            "batchNo": "TESTBatch6",
                            "expDate": "2020-01-01",
                            "stockQty": "1500"
                        }, {
                            "no": "7",
                            "invoiceNo": "TESTINVO5",
                            "batchNo": "TESTBatch5",
                            "expDate": "2020-01-01",
                            "stockQty": "1000"
                        }, {
                            "no": "8",
                            "invoiceNo": "TESTINVO6",
                            "batchNo": "TESTBatch6",
                            "expDate": "2020-01-01",
                            "stockQty": "2000"
                        }
                    ]
                }, {
                    "storeName": "Drug Store 3",
                    "dStoreID": 4,
                    "batch": "",
                    "reason": "New",
                    "stockQty": 5500,
                    "price": 3.99,
                    "batchDetails": [
                        {
                            "no": "9",
                            "invoiceNo": "TESTINVO7",
                            "batchNo": "TESTBatch7",
                            "expDate": "2020-01-01",
                            "stockQty": "2000"
                        }, {
                            "no": "10",
                            "invoiceNo": "TESTINVO8",
                            "batchNo": "TESTBatch8",
                            "expDate": "2020-01-01",
                            "stockQty": "3500"
                        }
                    ]
                }
            ],
            rows2: [],
            genOrder: {
                warehouse_id: null,
                created_by: null,
                order_for: 0,
                type: "Pharmacy"
            },
            getCartItems: {
                pharmacy_order_id: null,
                status: 'Cart',
                limit: 10,
                page: 0,
                warehouse_id: null,
            },
            suggestedWareHouses: {
                item_id: 0,
                warehouse_id: null,
                limit: 10,
                page: 0,
                select_type: "DRUG_STORE_REQUEST"
            },
            addSuggestedWareHouseCart: {
                order_item_id: 0,
                order_item_details: []
            },
            cartItems: [],
            msg: null,
            options: {
                legend: {
                    data: ["Actual Consumption", "Suggested Consumption"]
                },
                grid: {
                    left: "3%",
                    right: "4%",
                    bottom: "3%",
                    containLabel: true
                },
                xAxis: {
                    type: "category",
                    data: [
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun"
                    ]
                },
                yAxis: {
                    type: "value"
                },
                series: [
                    {
                        name: "Actual Consumption",
                        type: "bar",
                        data: [
                            320,
                            302,
                            301,
                            334,
                            390,
                            330,
                            320
                        ]
                    }, {
                        name: "Suggested Consumption",
                        type: "bar",
                        data: [
                            150,
                            212,
                            201,
                            154,
                            190,
                            330,
                            410
                        ]
                    }
                ],
                tooltip: {
                    trigger: "axis"
                },
                color: ["#3483eb", "#34bdeb"]
            },
            suggestedWareHouseColumn: [
                {
                    name: 'Action',
                    label: 'Action',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            return <IconButton onClick={() => {
                                this.setState({
                                    item_warehouse_id: this.state.rows2[dataIndex].warehouse_id,
                                    showItemBatch: true
                                })

                            }}>
                                <ListIcon />
                            </IconButton>
                        }
                    }
                },
                // {     name: 'uom',     label: 'UOM',     options: {} },
                {
                    name: '	Drug Store',
                    label: 'Drug Store',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.rows2[dataIndex].warehouse_name
                            return data
                        }
                    }
                },
                {
                    name: 'Type',
                    label: 'Type',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.rows2[dataIndex].warehouse_main_or_personal
                            return data
                        }
                    }
                },
                {
                    name: 'Stock Qty',
                    label: 'Stock Qty',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            let data = this.state.rows2[dataIndex].total_quantity

                            if (this.state.isConvertedOrderUom) {
                                return roundDecimal(data * this.state.ConvertedOrderUomQty, 2) + ' ' + this.state.disUnit
                            } else {
                                return data
                            }

                        }
                    }
                },

                {
                    name: 'Order',
                    label: 'Order Qty',
                    options: {
                        customBodyRenderLite: (dataIndex) => {
                            return <div className='row'>
                                <>
                                    {(this.state.isConvertedOrderUom && (parseFloat(this.state.orderQty) + parseFloat(this.state.itemTotalQty) > 0)) &&
                                        <p className='pt-1 pb-1 pl-5 pr-5' style={{ border: '1px solid #ffd600', backgroundColor: '#fff59d', borderRadius: '3px', textAlign: 'center' }}>{roundDecimal((parseFloat(this.state.itemTotalQty)) / this.state.ConvertedOrderUomQty, 2) + ' ' + this.state.mesUnit}</p>
                                    }
                                    <TextField
                                        variant="outlined"
                                        size="small"
                                        className=" w-full"
                                        placeholder="Order Qty"
                                        InputProps={{
                                            endAdornment: (
                                                this.state.isConvertedOrderUom ? (
                                                    <InputAdornment position="end" className='mr-1'>
                                                        {this.state.disUnit}
                                                    </InputAdornment>
                                                ) : null // Render nothing when the condition is not met
                                            )
                                        }}
                                        onChange={(e) => {
                                            console.log("adad", this.state.rows2[dataIndex])

                                            if ((parseInt(e.target.value) <= parseInt(this.state.rows2[dataIndex].total_quantity)) || e.target.value == null || e.target.value == '') {
                                                this.addSuggestedWareHouseCart(this.state.rows2[dataIndex].warehouse_id, parseInt(e.target.value), this.state.rows2[dataIndex].warehouse_name, this.state.rows2[dataIndex].total_quantity, 10)

                                            } else {
                                                this.addSuggestedWareHouseCart(this.state.rows2[dataIndex].warehouse_id, this.state.rows2[dataIndex].total_quantity, this.state.rows2[dataIndex].warehouse_name, this.state.rows2[dataIndex].total_quantity, 10)
                                                this.setState({
                                                    alert: true,
                                                    message: "Store Quantity Exceeded. Please enter a lower value. Maxumim stock of " + this.state.rows2[dataIndex].total_quantity + " will be added.",
                                                    severity: "Error"
                                                })

                                            }

                                        }
                                        }
                                        type='number'>

                                    </TextField>
                                </>


                            </div>
                        }
                    }
                },

            ],

            totalItems: 0,
            warehouseSelectDone: false,

        }

    }

    async getOrderItems() {
        this.setState({ updateQty: false })

        let params = {
            to: this.state.genOrder.warehouse_id,
            item_id: this.state.data[this.state.selectedID]?.item_id,
            status: ['Pending', 'ORDERED', 'APPROVED', 'Active'],
            from_date: null,
            to_date: null,
            // 'order[0]': [
            //     'createdAt', 'DESC'
            // ],
            page: this.state.formData3.page,
            limit: this.state.formData3.limit
        }
        let batch_res = await DistributionCenterServices.getSingleOrderItems(params)
        if (batch_res.status == 200) {

            this.setState({
                orderItemData: batch_res.data.view.data,
                totalItems2: batch_res.data.view?.totalItems
            })
            console.log('Batchs', this.state.orderItemData)
            this.setState({ updateQty: true })
        }
    }

    async setPageOrderItem(page) {
        //Change paginations
        let formData3 = this.state.formData3
        formData3.page = page
        this.setState({
            formData3
        }, () => {
            console.log("New formdata", this.state.formData)
            this.getOrderItems()
        })
    }

    async getOrderItemsTotal() {
        this.setState({ updateQty: false })

        let params = {
            to: this.state.genOrder.warehouse_id,
            item_id: this.state.data[this.state.selectedID]?.item_id,
            status: ['Pending', 'ORDERED', 'APPROVED', 'Active'],
            sum_needed: true,
            from_date: null,
            to_date: null
            // 'order[0]': [
            //     'createdAt', 'DESC'
            // ],
        }
        let batch_res = await DistributionCenterServices.getSingleOrderItems(params)
        if (batch_res.status == 200) {

            this.setState({ orderItemDataTot: batch_res.data.view.data })
            console.log('total', this.state.orderItemDataTot)
            this.setState({ updateQty: true })
        }
    }

    genOrderDays(day, type) {
        return day * type
    }

    load_days(max) {
        for (let index = 1; index < max; index++) {
            this
                .state
                .all_days
                .push({ id: index, date: index.toString() });
        }
        this.render()
    }

    async setPage(page) {
        //Change paginations
        let formData = this.state.formData
        formData.page = page
        this.setState({
            formData
        }, () => {
            console.log("New formdata", this.state.formData)
            this.loadOrderList()
        })
    }

    componentDidMount() {
        this.loadWarehouses()
        this.load_days(31)
        this.loadData()
        this.loadOrderList()
        // this.getOrderItems()
    }

    async getBatchData() {
        this.setState({ updateQty: false })
        let params = {
            warehouse_id: this.state.genOrder.warehouse_id,
            item_id: this.state.data[this.state.selectedItem].item_id,
            exp_date_grater_than_zero: true,
            quantity_grater_than_zero: true,
            'order[0]': [
                'createdAt', 'DESC'
            ],
        }
        let batch_res = await DistributionCenterServices.getBatchData(params)
        if (batch_res.status == 200) {

            this.setState({ myStockData: batch_res.data.view.data })
            console.log('Batch Data', this.state.myStockData)
            this.setState({ updateQty: true })
        }
    }
    async loadData() {
        //function for load initial data from backend or other resources
        let ven_res = await WarehouseServices.getVEN({ limit: 99999 })
        if (ven_res.status == 200) {
            console.log('Ven', ven_res.data.view.data)
            this.setState({ all_ven: ven_res.data.view.data })
        }
        let cat_res = await CategoryService.fetchAllCategories({ limit: 99999 })
        if (cat_res.status == 200) {
            console.log('Categories', cat_res.data.view.data)
            this.setState({ all_item_category: cat_res.data.view.data })
        }
        let class_res = await
            ClassDataSetupService.fetchAllClass({ limit: 99999 })
        if (class_res.status == 200) {
            console.log('Classes', class_res.data.view.data)
            this.setState({ all_item_class: class_res.data.view.data })
        }
        let group_res = await GroupSetupService.fetchAllGroup({ limit: 99999 })
        if (group_res.status == 200) {
            console.log('Groups', group_res.data.view.data)
            this.setState({ all_item_group: group_res.data.view.data })
        }
    }

    async loadOrderList() {
        this.setState({ cartStatus: [] })

        let formData = this.state.formData

        let res = await PharmacyOrderService.getOrderList(formData)

        if (res.status) {
            if (res.data.view.data.length != 0) {
                this.setState({ loaded: false })
                let order_id = res
                    .data
                    .view
                    .data[0]
                    .pharmacy_order_id
                localStorageService.removeItem('orderGeneratedIdItemWise')
                this.setState({ processing_in_generate: false, orderID: order_id })

                this.state.getCartItems.pharmacy_order_id = order_id
                let item_ids = res.data.view.data.map(x => x.item_id)
                //console.log("loadPrescriptionDrugAssign", item_ids)
                this.loadPrescriptionDrugAssign(item_ids)
                this.setState({
                    data: res.data.view.data,
                    //loaded: true,
                    totalItems: res.data.view.totalItems,
                }, () => {
                    this.render()
                    //this.getCartItems()
                    console.log("Table Data", this.state.data);
                })

            } else {//if still not generted order
                this.setState({ data: [], loaded: true })
                this.getGenerateStatus()

            }


        }
    }
    async loadPrescriptionDrugAssign(itemIds) {
        let params = {
            owner_id: this.state.owner_id,
            from: moment().subtract(180, 'days').format('YYYY-MM-DD'),
            to: moment().format('YYYY-MM-DD'),
            drug_id: itemIds,
            search_type: 'Sum'
        }
        let res = await PharmacyOrderService.prescriptionDrugAssign(params)
        //let order_id = 0
        console.log("loadPrescriptionDrugAssign", res.data.view)
        if (res.status) {

            this.setState({
                prescriptionDrugAssign: res.data.view,
                loaded: true,
            }, () => {

            })
        }
    }

    async getCartItems() {
        let res2 = await PharmacyOrderService.getOrderList(this.state.getCartItems)
        if (res2.status) {
            this.setState({
                cartItems: res2.data.view.data
            }, () => {
                console.log("cart", res2.data.view.data)
                this.render()
            })
        }
    }


    async getGenerateStatus() {
        let created_orderId = await localStorageService.getItem('orderGeneratedIdItemWise')
        if (created_orderId) {
            this.setState({ processing_in_generate: true })
            setTimeout(() => {
                this.loadOrderList()
            }, 5000);
        } else {
            this.setState({ processing_in_generate: false })
        }
    }

    async generateOrder() {
        this.setState({ loaded: false })

        const query = new URLSearchParams(this.props.location?.search);
        const type = query.get('type')
        let genOrder = this.state.genOrder
        if (type == 'SellsOrder') {
            genOrder.type = 'Sales Order'
        } else {
            genOrder.type = 'Pharmacy'
        }

        let res = await PharmacyOrderService.genOrder(genOrder)
        if (res.status) {
            this.setState({ msg: res.data.posted.msg })
            this.state.msg == ("data has been added successfully.")
                ? this.setState({
                    alert: true, message: this.state.msg, severity: 'success',
                    orderID: res.data.posted.data.id
                })
                : this.setState({
                    alert: true,
                    message: this.state.msg,
                    severity: 'error',
                    //orderID: res.data.posted.data.data[0].OrderRequirement.id,
                    orderExistWarning: true
                })

            await localStorageService.setItem('orderGeneratedIdItemWise',
                res.data.posted.data.id)
            this.loadOrderList()
            /* setTimeout(() => {
                this.loadOrderList()
            }, 2000); */

        }
    }

    async removeOrder() {
        this.setState({ loaded: false })
        let res = await PharmacyOrderService.deleteOrderRequement(this.state.orderID)
        if (res.status) {
            if (res.data.view == "data deleted successfully.") {
                this.setState({
                    loaded: true,
                    alert: true,
                    message: res.data.view,
                    severity: 'success',
                    cartItems: []
                }, () => {
                    this.render()
                    this.setState({
                        cartItems: []
                    })
                })
            }

            this.loadOrderList()
        } else {
            this.setState(
                { alert: true, message: "Order Could Not be Deleted. Please Try Again", severity: 'error' }
            )
        }

    }

    async addtocart() {
        let params

        if (this.state.convert) {
            params = this.state.cartStatus[this.state.selectedItem]
            params.order_quantity = this.state.cartStatus[this.state.selectedItem].order_quantity / this.state.convertQty

            this.setState({
                params
            })
        } else {
            params = this.state.cartStatus[this.state.selectedItem]

            this.setState({
                params
            })
        }
        console.log('cheking cartStatus', params)
        let res = await PharmacyOrderService.addToCart(
            this.state.addtocart, params

        )

        if (res.status) {
            if (res.status == 200) {
                this.setState({
                    loaded: true,
                    alert: true,
                    message: "Item Added to Cart Successfully",
                    severity: 'success',
                    showAddRemark: false
                }, () => {
                    this.render()
                    this.getCartItems()
                    this
                        .state
                        .cartStatus[this.state.selectedItem]
                        .buttonState = true
                    this
                        .state
                        .cartStatus[this.state.selectedItem]
                        .color = "grey"
                    this
                        .state
                        .cartStatus[this.state.selectedItem]
                        .tooltip = "Added to Cart"
                })
            }
        }
        else {
            this.setState(
                { alert: true, message: "Item adding to cart failed. Please Try Again", severity: 'error' }
            )
        }

    }

    // table hide and view
    toggleTableVisibility = () => {
        this.setState(prevState => ({
            isTableVisible: !prevState.isTableVisible
        }));
    };

    toggleTableVisibilityPO = () => {
        this.setState(prevState => ({
            isTableVisiblePO: !prevState.isTableVisiblePO
        }));
    };



    addSuggestedWareHouseCart(
        warehouseid,
        orderqty,
        drugstore,
        storeqty,
        storerecieveqty
    ) {
        this.setState({ updateQty: false })
        if (this.state.addSuggestedWareHouseCart.order_item_details.length == 0) {
            this.state.addSuggestedWareHouseCart.order_item_details.push(
                {
                    warehouse_id: warehouseid,
                    order_quantity: orderqty,
                    drug_store_name: drugstore,
                    store_quantity: storeqty,
                    store_recervable_quantity: storerecieveqty
                }
            )
        } else {
            let found = false
            let pos = 0
            this.state.addSuggestedWareHouseCart.order_item_details.find((warehouse, index) => {
                if (warehouse != null) {
                    if (warehouse.warehouse_id == warehouseid) {
                        console.log("orderItem warehouse equal", index);
                        found = true
                        pos = index
                    }
                }
            })

            if (found) {
                if (orderqty == "0" | orderqty == null | orderqty == '') {
                    console.log("removed", pos);
                    this.state.addSuggestedWareHouseCart.order_item_details.splice(pos, 1)
                } else {
                    console.log("orderItem Index", pos);
                    this.state.addSuggestedWareHouseCart.order_item_details[pos].order_quantity = orderqty
                }
            } else {
                this.state.addSuggestedWareHouseCart.order_item_details.push(
                    {
                        warehouse_id: warehouseid,
                        order_quantity: orderqty,
                        drug_store_name: drugstore,
                        store_quantity: storeqty,
                        store_recervable_quantity: storerecieveqty
                    }
                )
            }


        }

        this.state.itemTotalQty = 0
        for (let index = 0; index < this.state.addSuggestedWareHouseCart.order_item_details.length; index++) {
            this.state.itemTotalQty += parseInt(this.state.addSuggestedWareHouseCart.order_item_details[index].order_quantity)
        }
        console.log("OrderItems total", this.state.itemTotalQty);
        this.setState({ updateQty: true })
        console.log('OrderItems', this.state.addSuggestedWareHouseCart);

    }

    async addSuggested() {

        let param

        if (this.state.isConvertedOrderUom) {
            param = this.state.addSuggestedWareHouseCart
            console.log('cheking qty', param.order_item_details[0].order_quantity)
            for (let i = 0; i < param.order_item_details.length; i++) {
                param.order_item_details[i].order_quantity = Number(param.order_item_details[i].order_quantity) / Number(this.state.ConvertedOrderUomQty)
            }

            this.setState({
                param
            })
        } else {
            param = this.state.addSuggestedWareHouseCart

            this.setState({
                param
            })
        }
        console.log('cheking kkkkkkkk - 2', param, this.state.isConvertedOrderUom)
        let res = await PharmacyOrderService.suggestedWareHouseCart(
            this.state.addSuggestedWareHouseCart
        )
        if (res.status) {
            if (res.data.posted == "data has been added successfully.") {
                this.setState({
                    loaded: true,
                    alert: true,
                    message: "Item Added to Cart Successfully",
                    severity: 'success'
                }, () => {
                    this.render()
                    this.loadOrderList()
                    this
                        .state
                        .cartStatus[this.state.selectedItem]
                        .buttonState = true
                    this
                        .state
                        .cartStatus[this.state.selectedItem]
                        .color = "grey"
                    this
                        .state
                        .cartStatus[this.state.selectedItem]
                        .tooltip = "Added to Cart"
                })
            }
        } else {
            this.setState(
                { alert: true, message: "Item adding to cart failed. Please Try Again", severity: 'error' }
            )
        }
    }

    async saveStepOneSubmit() { }

    async SubmitAll() { }

    handleFileSelect = (event) => {
        const { selectedFiles, selectedFileList } = this.props
        let files = event
            .target
            .files

        this
            .setState({
                files: files
            }, () => { })
    }

    async loadWarehouses() {
        this.setState({ loaded: false })
        var user = await localStorageService.getItem('userInfo');
        console.log('user', user)
        var id = user.id;
        var all_pharmacy_dummy = [];
        var selected_warehouse_cache = await localStorageService.getItem('Selected_Warehouse');
        if (!selected_warehouse_cache) {
            this.setState({ dialog_for_select_warehouse: true })
        }
        else {
            this.state.genOrder.created_by = id
            this.state.genOrder.warehouse_id = selected_warehouse_cache.id
            this.state.getCartItems.warehouse_id = selected_warehouse_cache.id
            this.state.suggestedWareHouses.warehouse_id = selected_warehouse_cache.id
            this.state.formData.warehouse_id = selected_warehouse_cache.id
            this.state.formData.owner_id = selected_warehouse_cache.owner_id
            this.setState({ owner_id: selected_warehouse_cache.owner_id, selected_warehouse: selected_warehouse_cache.id, dialog_for_select_warehouse: false, warehouseSelectDone: true })
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
            this.setState({ all_warehouse_loaded: all_pharmacy_dummy, loaded: true })
        }
    }
    async suggestedWareHouse() {
        this.setState({ loadingSuggestedWarehoues: false })
        let res = await PharmacyOrderService.getSuggestedWareHouse(
            this.state.suggestedWareHouses
        )
        if (res.status) {
            console.log('suggested', res.data)
            this.setState({
                rows2: res.data.view.data,
                suggestedtotalItems: res.data.view.totalItems,
                loadingSuggestedWarehoues: true
            }, () => {
                this.render()
            })
        }
    }
    // async suggestedWareHouse() {
    //     let res = await PharmacyOrderService.getSuggestedWareHouse(
    //         this.state.suggestedWareHouses
    //     )
    //     if (res.status) {
    //         console.log('suggested', res.data)
    //         this.setState({
    //             rows2: res.data.view.data
    //         }, () => {
    //             this.render()
    //         })
    //     }
    // }
    setSuggestedPage(page) {
        let suggestedWareHouses = this.state.suggestedWareHouses;
        suggestedWareHouses.page = page;
        this.setState({
            suggestedWareHouses
        }, () => {
            this.suggestedWareHouse()
        })
    }



    render() {
        const buttonName = this.state.isTableVisible ? 'Hide' : 'Show';
        const buttonNamePO = this.state.isTableVisiblePO ? 'Hide' : 'Show';
        const { classes } = this.props;
        const SuggestedTable = <TableContainer component={Paper}>

            {this.state.loadingSuggestedWarehoues ?
                <LoonsTable
                    //title={"All Aptitute Tests"}
                    id={'suggested'} data={this.state.rows2}
                    columns={this.state.suggestedWareHouseColumn}
                    options={{
                        pagination: true,
                        serverSide: true,
                        count: this.state.suggestedtotalItems,
                        rowsPerPage: 20,
                        page: this.state.suggestedWareHouses.page,
                        onTableChange: (action, tableState) => {
                            console.log(action, tableState)
                            switch (action) {
                                case 'changePage':
                                    this.setSuggestedPage(tableState.page)
                                    break
                                case 'sort':
                                    //this.sort(tableState.page, tableState.sortOrder);
                                    break
                                default:
                                    console.log('action not handled.')
                            }
                        }
                    }}></LoonsTable>
                : null}

            {/*   <Table aria-label="collapsible table">
                <TableHead>
                     <TableRow>
                        <TableCell></TableCell>
                      <TableCell>
                            <strong>Drug Store ID</strong>
                        </TableCell> 
                        <TableCell>
                            <strong>Drug Store</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Batch Details</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Reason</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Stock Qty</strong>
                        </TableCell>
                        <TableCell>
                            <strong>Order</strong>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        this.state.rows2.length != 0
                            ? this
                                .state
                                .rows2
                                .map((row) => (
                                    <Row
                                        key={row.name}
                                        row={row}
                                        onChangeFunc={this
                                            .addSuggestedWareHouseCart
                                            .bind(this)} />
                                ))
                            : <TableRow>
                                <TableCell colSpan={10}>
                                    <Typography className='text-center font-semibold'>
                                        No Suggested Warehouses to Display</Typography>
                                </TableCell>
                            </TableRow>
                    }
                </TableBody>
            </Table>*/}
        </TableContainer>;
        const OrderQTY =
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '10px'
                }}>
                <div>
                    Total Order Qty
                </div>
                <div className='pr-5 pl-5'>

                    <input value={this.state.updateQty ? (parseFloat(this.state.orderQty) + parseFloat(this.state.itemTotalQty)) + ' ' + this.state.disUnit : 'N/A'}></input>
                    {/* <input value={parseInt(this.state.orderQty) + parseInt(this.state.itemTotalQty)}></input> */}
                </div>
                <div >
                    {(this.state.isConvertedOrderUom && (parseFloat(this.state.orderQty) + parseFloat(this.state.itemTotalQty) > 0)) &&
                        <p className='m-0 p-0 pl-5 pr-5' style={{ border: '1px solid #ffd600', backgroundColor: '#fff59d', borderRadius: '3px', textAlign: 'center' }}>{roundDecimal((parseFloat(this.state.orderQty) + parseFloat(this.state.itemTotalQty)) / this.state.ConvertedOrderUomQty, 2) + ' ' + this.state.mesUnit}</p>
                    }
                </div>
            </div>;
        const EstimateConsumption = <div style={{
            display: 'flex'
        }}>
            <div>
                System Estimated Consumption
            </div>
            <div className='pr-5 pl-5'>
                <input value={this.state.consumpEstimate}></input>
            </div>
        </div>;
        return (<Fragment>
            <MainContainer>
                {/* Filtr Section */}

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'nowrap',
                        justifyContent: 'space-between',
                        aligroupItems: 'baseline'
                    }}>
                    <div
                        style={{
                            display: 'flex',
                            aligroupItems: 'baseline'
                        }}>
                        <ValidatorForm
                            onSubmit={() => this.generateOrder()}
                            onError={() => null}>
                            <Grid
                                container="container"
                                lg={12}
                                md={12}
                                xs={12}

                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-end'
                                }}>

                                {/* <div
                                className="mr-2"
                                style={{
                                    display: 'flex',
                                    aligroupItems: 'flex-end'
                                }}> */
                                }
                                <Grid item="item" >
                                    <h5 >Set Order For</h5>
                                </Grid>
                                <Grid item="item" className="mr-2">
                                    <Autocomplete
                                        disableClearable
                                        options={this.state.all_days}
                                        onChange={(e, value) => {
                                            if (value != null) {
                                                this.state.selectedDays = value.date
                                                if (this.state.selectedType == "Days") {
                                                    this.state.genOrder.order_for = this.genOrderDays(this.state.selectedDays, 1)
                                                } else if (this.state.selectedType == "Months") {
                                                    this.state.genOrder.order_for = this.genOrderDays(this.state.selectedDays, 30)
                                                } else {
                                                    this.state.genOrder.order_for = value.date
                                                }

                                            }
                                        }}
                                        value={this
                                            .state
                                            .all_days
                                            .find((v) => v.id == this.state.all_days_id)}
                                        getOptionLabel={(
                                            option) => option.date
                                                ? option.date
                                                : ''}
                                        renderInput={(params) => (
                                            <TextValidator
                                                {...params}
                                                placeholder="Days"
                                                variant="outlined"
                                                size="small"
                                                required="required" />
                                        )} />
                                </Grid>

                                <Grid item="item" className="mr-2">

                                    <Autocomplete
                                        disableClearable
                                        options={this.state.day_month}
                                        onChange={(e, value) => {
                                            if (value != null) {
                                                if (value.name == "Days") {
                                                    this.state.genOrder.order_for = this.genOrderDays(this.state.selectedDays, 1)
                                                } else {
                                                    this.state.genOrder.order_for = this.genOrderDays(this.state.selectedDays, 30)
                                                }
                                                this.setState({ selectedType: value.name })
                                            }
                                        }}
                                        value={this
                                            .state
                                            .day_month
                                            .find((v) => v.id == this.state.day_month_id)}
                                        getOptionLabel={(
                                            option) => option.name
                                                ? option.name
                                                : ''}
                                        renderInput={(params) => (
                                            <TextValidator
                                                {...params}
                                                placeholder="Days"
                                                variant="outlined"
                                                size="small"
                                                required="required" />
                                        )} />
                                </Grid>
                                <Grid item="item" >
                                    <LoonsButton progress={this.state.processing_in_generate} color="primary" size="medium" type="submit">Generate</LoonsButton>
                                </Grid>
                                {this.state.processing_in_generate &&
                                    <Grid item="item" className='ml-2'>
                                        <LoonsButton color="primary" size="medium" onClick={() => { localStorageService.removeItem('orderGeneratedIdItemWise') }}>Reset</LoonsButton>
                                    </Grid>
                                }
                            </Grid>
                        </ValidatorForm>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            aligroupItems: 'baseline'
                        }}>
                        <div className="mr-2">
                            {/*   <h6>Order From: Counter Pharmacist</h6> */}
                        </div>
                        <div>
                            <div>
                                {this.state.loaded && this.state.warehouseSelectDone ? <Badge badgeContent={this.state.cartItems.length} color="primary">
                                    <ShoppingCartIcon fontSize="large" />
                                </Badge>
                                    : <Badge badgeContent='0' color="primary">
                                        <ShoppingCartIcon fontSize="large" />
                                    </Badge>
                                }
                            </div>
                            <div></div>
                        </div>
                    </div>
                </div>

                <ValidatorForm
                    className="pt-2"
                    onSubmit={() => this.setPage(0)}
                    onError={() => null}>
                    {/* Main Grid */}
                    <Grid container="container" spacing={2} direction="row">
                        <Grid item="item" xs={12} sm={12} md={12} lg={12}>
                            <Grid container="container" spacing={2}>
                                {/* Ven */}
                                <Grid item="item" xs={12} sm={12} md={3} lg={3}>
                                    <SubTitle title="Ven" />
                                    <Autocomplete
                                        disableClearable className="w-full"
                                        options={this.state.all_ven.sort((a, b) => (a.name?.localeCompare(b.name)))}
                                        onChange={(e, value) => {
                                            let formData = this.state.formData
                                            if (value != null) {
                                                formData.ven_id = value.id
                                            } else {
                                                formData.ven_id = null
                                            }
                                            console.log(this.state.formData);
                                            this.setState({ formData })
                                        }}
                                        /*  defaultValue={this.state.all_district.find(
                                        (v) => v.id == this.state.formData.district_id
                                        )} */
                                        value={this
                                            .state
                                            .all_ven
                                            .find((v) => v.id == this.state.formData.ven_id)} getOptionLabel={(
                                                option) => option.name
                                                    ? option.name
                                                    : ''} renderInput={(params) => (
                                                        <TextValidator {...params} placeholder="Ven"
                                                            //variant="outlined"
                                                            fullWidth="fullWidth" variant="outlined" size="small" />
                                                    )} />
                                </Grid>

                                {/* Serial/Family Number */}
                                <Grid className=" w-full" item="item" lg={3} md={3} sm={12} xs={12}>
                                    <SubTitle title="Item Class" />
                                    <Autocomplete
                                        disableClearable className="w-full"
                                        options={this.state.all_item_class.sort((a, b) => (a.description?.localeCompare(b.description)))}
                                        onChange={(e, value) => {
                                            let formData = this.state.formData
                                            if (value != null) {
                                                formData.class_id = value.id
                                            } else {
                                                formData.class_id = null
                                            }
                                            console.log(this.state.formData);
                                            this.setState({ formData })
                                        }}
                                        /*  defaultValue={this.state.all_district.find(
                                        (v) => v.id == this.state.formData.district_id
                                        )} */
                                        value={this
                                            .state
                                            .all_item_class
                                            .find((v) => v.id == this.state.formData.class_id)}

                                        getOptionLabel={(
                                            option) => option.description
                                                ? option.description
                                                : ''}

                                        renderInput={(params) => (
                                            <TextValidator {...params} placeholder="Item Class"
                                                //variant="outlined"
                                                fullWidth="fullWidth" variant="outlined" size="small" />
                                        )} />
                                </Grid>

                                <Grid className=" w-full" item="item" lg={3} md={3} sm={12} xs={12}>
                                    <SubTitle title="Stock Days >= More Than" />
                                    <TextValidator
                                        className=" w-full"
                                        placeholder="Stock Days >= More Than"
                                        name="stockMore"
                                        InputLabelProps={{
                                            shrink: false
                                        }}
                                        value={this.state.formData.moreStock}
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        min={0}
                                        InputProps={{
                                            inputProps: { min: 0 },

                                        }}
                                        // validators={['minNumber:0.99', 'maxNumber:255',]}
                                        // errorMessages={['Please Enter value more than 1']}
                                        onChange={(e) => {
                                            let formData = this.state.formData
                                            formData.moreStock = parseInt(e.target.value)
                                            this.setState({
                                                formData
                                                // formData: {
                                                //     ...this.state.moreStock,
                                                //     moreStock: e.target.value
                                                // }
                                            })
                                        }} />
                                </Grid>

                                {/* Stock Days 1 */}
                                <Grid className=" w-full" item="item" lg={3} md={3} sm={12} xs={12}>
                                    <SubTitle title="Stock Days <= Less Than" />
                                    <TextValidator
                                        className=" w-full"
                                        placeholder="Stock Days <= Less Than"
                                        name="lessStock"
                                        InputLabelProps={{
                                            shrink: false
                                        }}
                                        InputProps={{
                                            inputProps: {
                                                min: 0,
                                                step: 0.5,
                                            },

                                        }}
                                        value={this.state.formData.lessStock}
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        onChange={(e) => {
                                            let formData = this.state.formData
                                            formData.lessStock = parseInt(e.target.value)
                                            this.setState({
                                                formData
                                                // formData: {
                                                //     ...this.state.formData,
                                                //     lessStock: e.target.value
                                                // }
                                            })
                                        }} />
                                </Grid>

                                {/* Serial Family Name*/}
                                <Grid className=" w-full" item="item" lg={3} md={3} sm={12} xs={12}>
                                    <SubTitle title="Item Category" />

                                    <Autocomplete
                                        disableClearable className="w-full"
                                        options={this.state.all_item_category.sort((a, b) => (a.description?.localeCompare(b.description)))}
                                        onChange={(e, value) => {
                                            let formData = this.state.formData
                                            if (value != null) {
                                                formData.item_category_id = value.id
                                            } else {
                                                formData.item_category_id = null
                                            }
                                            console.log(this.state.formData);
                                            this.setState({ formData })
                                        }}
                                        /*  defaultValue={this.state.all_district.find(
                                        (v) => v.id == this.state.formData.district_id
                                        )} */
                                        value={this
                                            .state
                                            .all_item_category
                                            .find((v) => v.id == this.state.formData.category_id)}
                                        getOptionLabel={(
                                            option) => option.description
                                                ? option.description
                                                : ''}
                                        renderInput={(params) => (
                                            <TextValidator {...params} placeholder="Item Category"
                                                //variant="outlined"
                                                fullWidth="fullWidth" variant="outlined" size="small" />
                                        )} />
                                </Grid>

                                {/* Item Group*/}
                                <Grid className=" w-full" item="item" lg={3} md={3} sm={12} xs={12}>
                                    <SubTitle title="Item Group" />

                                    <Autocomplete
                                        disableClearable
                                        className="w-full"
                                        options={this.state.all_item_group.sort((a, b) => (a.name?.localeCompare(b.name)))}
                                        onChange={(e, value) => {
                                            let formData = this.state.formData
                                            if (value != null) {
                                                formData.item_group_id = value.id
                                            } else {
                                                formData.item_group_id = null
                                            }
                                            console.log(this.state.formData);
                                            this.setState({ formData })
                                        }}
                                        value={this
                                            .state
                                            .all_item_group
                                            .find((v) => v.id == this.state.formData.group_id)}
                                        getOptionLabel={(
                                            option) => option.name
                                                ? option.name
                                                : ''}
                                        renderInput={(params) => (
                                            <TextValidator {...params} placeholder="Item Group"
                                                //variant="outlined"
                                                fullWidth="fullWidth" variant="outlined" size="small" />
                                        )} />
                                </Grid>

                                {/* Item Group*/}
                                <Grid className=" w-full" item="item" lg={3} md={3} sm={12} xs={12}>
                                    <SubTitle title="Warehouses" />

                                    <Autocomplete
                                        disableClearable
                                        className="w-full"
                                        options={this.state.all_warehouse_loaded.sort((a, b) => (a.name?.localeCompare(b.name)))}
                                        onChange={(e, value) => {
                                            let formData = this.state.formData
                                            if (value != null) {
                                                formData.warehouse = value.id
                                            } else {
                                                formData.warehouse = null
                                            }
                                            console.log(this.state.formData);
                                            this.setState({ formData })
                                        }}
                                        value={this
                                            .state
                                            .all_warehouse_loaded
                                            .find((v) => v.id == this.state.formData.group_id)}
                                        getOptionLabel={(
                                            option) => option.name
                                                ? option.name
                                                : ''}
                                        renderInput={(params) => (
                                            <TextValidator {...params} placeholder="Warehouses"
                                                //variant="outlined"
                                                fullWidth="fullWidth" variant="outlined" size="small" />
                                        )} />
                                </Grid>

                                {/* Drug Store Qty*/}
                                <Grid className=" w-full" item="item" lg={3} md={3} sm={12} xs={12}>
                                    <SubTitle title="Drug Store Qty" />

                                    <TextValidator className=" w-full" placeholder="Drug Store Qty" name="drug_store_qty" InputLabelProps={{
                                        shrink: false
                                    }} value={this.state.formData.description} type="text" variant="outlined" size="small" onChange={(e) => {
                                        this.setState({
                                            formData: {
                                                ...this.state.formData,
                                                description: e.target.value
                                            }
                                        })
                                    }}
                                    //validators={['required']}

                                    //errorMessages={['this field is required']}
                                    />
                                </Grid>

                                <Grid
                                    item="item"
                                    lg={3}
                                    md={3}
                                    sm={12}
                                    xs={12}
                                    className=" w-full flex justify-start">
                                    {/* Submit Button */}
                                    <LoonsButton className="mt-5 mr-2" progress={false} type='submit'
                                    //onClick={this.handleChange}
                                    >
                                        <span className="capitalize">
                                            {
                                                this.state.isUpdate
                                                    ? 'Update'
                                                    : 'Filter'
                                            }
                                        </span>
                                    </LoonsButton>
                                    {/* Cancel Button */}
                                    {/* <LoonsButton
                                        className="mt-5"
                                        progress={false}
                                        scrollToTop={true}
                                        color="#cfd8dc"
                                        onClick={this.clearField}>
                                        <span className="capitalize">
                                            Show Short Expo
                                        </span>
                                    </LoonsButton> */}
                                </Grid>
                                <Grid item="item" lg={12} md={12} xs={12}></Grid>
                                <Grid
                                    item="item"
                                    lg={3}
                                    md={3}
                                    xs={3}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        marginTop: '-20px'

                                    }}>
                                    <SubTitle title="Search" />

                                    <TextValidator className='' placeholder="Search by SR or Item Name"
                                        //variant="outlined"
                                        fullWidth="fullWidth" variant="outlined" size="small" value={this.state.formData.search} onChange={(e, value) => {
                                            let formData = this.state.formData
                                            if (e.target.value != '') {
                                                formData.search = e.target.value;
                                            } else {
                                                formData.search = null
                                            }
                                            this.setState({ formData })
                                            console.log("form dat", this.state.formData)
                                        }}

                                        onKeyPress={(e) => {
                                            if (e.key == "Enter") {
                                                this.setPage(0)
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
                                                <InputAdornment onClick={() => { this.setPage(0) }} position="end">
                                                    <SearchIcon></SearchIcon>
                                                </InputAdornment>
                                            )
                                        }} />

                                </Grid>
                            </Grid>
                        </Grid>

                        {this.state.processing_in_generate ?
                            <div className={classes.root}>
                                <LinearProgress />
                                <div>
                                    <Alert severity='info' className='mt-1'>
                                        <Typography className='mt-2'>
                                            Please Wait Until Generate the Order Requirement. It Will Take Few Minutes.
                                        </Typography>
                                    </Alert>
                                </div>
                            </div>
                            : null
                        }

                        {/* Table Section */}
                        <Grid container="container" className="mt-3 pb-5">
                            <Grid item="item" lg={12} md={12} sm={12} xs={12}>
                                {
                                    this.state.loaded && this.state.warehouseSelectDone
                                        ? <LoonsTable
                                            //title={"All Aptitute Tests"}
                                            id={'allAptitute'} data={this.state.data} columns={this.state.columns} options={{
                                                pagination: true,
                                                serverSide: true,
                                                count: this.state.totalItems,
                                                rowsPerPage: this.state.formData.limit,
                                                page: this.state.formData.page,
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
                                                            console.log('action not handled.')
                                                    }
                                                }
                                            }}></LoonsTable>
                                        : (
                                            //loading effect
                                            <Grid className="justify-center text-center w-full pt-12">
                                                {!this.state.processing_in_generate && <CircularProgress size={30} />}
                                            </Grid>
                                        )
                                }

                            </Grid>
                        </Grid>
                    </Grid>
                </ValidatorForm>

            </MainContainer>

            <Dialog
                maxWidth="lg "
                open={this.state.lowStockWarning}
                onClose={() => {
                    this.setState({ lowStockWarning: false })
                }}>
                <div className="w-full h-full px-5 py-5">

                    <CardTitle title="Insufficient Stock Balance"></CardTitle>
                    <div>
                        <p>{this.state.medDetails.itemName}
                            stock balance is insufficient in {this.state.medDetails.drugStore}. Would you like to place the order from suggested Drug Store?</p>
                        <Grid
                            container="container"
                            style={{
                                justifyContent: 'flex-end'
                            }}>
                            <Grid
                                className="w-full flex justify-end"
                                item="item"
                                lg={6}
                                md={6}
                                sm={6}
                                xs={6}>
                                <LoonsButton
                                    className="mt-2"
                                    progress={false}
                                    type="submit"
                                    startIcon="save"
                                    onClick={() => {
                                        this.setState({
                                            lowStockWarning: false,
                                            suggestedWareHous: true,
                                            itemTotalQty: 0,
                                            orderQty: 0
                                        })
                                    }}>
                                    <span className="capitalize">Yes</span>
                                </LoonsButton>
                                <LoonsButton
                                    className="mt-2 ml-2"
                                    progress={false}
                                    type="submit"
                                    // startIcon="save"
                                    onClick={() => {
                                        // onClick={() => {
                                        //     if (this.state.addSuggestedWareHouseCart.order_item_details.length != 0) {
                                        //         this.addSuggested()
                                        //     } else {

                                        //     }
                                        this.setState({
                                            lowStockWarning: false,
                                            // suggestedWareHous: true,
                                            itemTotalQty: 0,
                                            orderQty: 0
                                        }, () => {
                                            this.addtocart()
                                        })
                                    }}>
                                    <span className="capitalize">Continue</span>
                                </LoonsButton>
                                <LoonsButton
                                    className="mt-2 ml-2"
                                    progress={false}
                                    type="submit"
                                    startIcon="close"
                                    onClick={() => {
                                        this.setState({ lowStockWarning: false });
                                    }}>
                                    <span className="capitalize">No</span>
                                </LoonsButton>
                            </Grid>
                        </Grid>
                    </div>
                </div>
            </Dialog>
            <Dialog
                maxWidth="lg "
                open={this.state.expiredStockWarning}
                onClose={() => {
                    this.setState({ expiredStockWarning: false })
                }}>
                <div className="w-full h-full px-5 py-5">

                    <CardTitle title="Expiring Stocks"></CardTitle>
                    <div>
                        <p>{this.state.medDetails.itemName}
                            stock is expired in {this.state.medDetails.drugStore}. Would you like to place the order from suggested Drug Store?</p>
                        <Grid
                            container="container"
                            style={{
                                justifyContent: 'flex-end'
                            }}>
                            <Grid
                                className="w-full flex justify-end"
                                item="item"
                                lg={6}
                                md={6}
                                sm={6}
                                xs={6}>
                                <LoonsButton
                                    className="mt-2"
                                    progress={false}
                                    type="submit"
                                    onClick={() => {
                                        this.setState({ expiredStockWarning: false, suggestedWareHous: true })
                                    }}>
                                    <span className="capitalize">Yes</span>
                                </LoonsButton>

                                <LoonsButton
                                    className="mt-2 ml-2"
                                    progress={false}
                                    type="submit"
                                    startIcon="close"
                                    onClick={() => {
                                        this.setState({ expiredStockWarning: false })
                                    }}>
                                    <span className="capitalize">No</span>
                                </LoonsButton>
                            </Grid>
                        </Grid>
                    </div>
                </div>
            </Dialog>
            <Dialog
                maxWidth="lg "
                open={this.state.orderExistWarning}
                onClose={() => {
                    this.setState({ orderExistWarning: false })
                }}>
                <div className="w-full h-full px-5 py-5">

                    <CardTitle title="Order Requirement already exist"></CardTitle>
                    <div>
                        <p>Order Requirement already exist. Please delete before regenerate.</p>
                        <Grid
                            container="container"
                            style={{
                                justifyContent: 'flex-end'
                            }}>
                            <Grid
                                className="w-full flex justify-end"
                                item="item"
                                lg={6}
                                md={6}
                                sm={6}
                                xs={6}>
                                <LoonsButton
                                    className="mt-2"
                                    progress={false}
                                    type="submit"
                                    startIcon="delete"
                                    onClick={() => {
                                        this.setState({ orderExistWarning: false, orderDeleteWarning: true })
                                    }}>
                                    <span className="capitalize">Delete</span>
                                </LoonsButton>

                                <LoonsButton
                                    className="mt-2 ml-2"
                                    progress={false}
                                    type="submit"
                                    startIcon={<ViewListIcon />}
                                    onClick={() => {
                                        this.setState({ orderExistWarning: false });
                                    }}>
                                    <span className="capitalize">View</span>
                                </LoonsButton>
                            </Grid>
                        </Grid>
                    </div>
                </div>
            </Dialog>

            <Dialog
                maxWidth="lg "
                open={this.state.orderDeleteWarning}
                onClose={() => {
                    this.setState({ orderDeleteWarning: false })
                }}>
                <div className="w-full h-full px-5 py-5">

                    <CardTitle title="Are you sure you want to delete?"></CardTitle>
                    <div>
                        <p>This order will be deleted and you will have to apply for a new order. This
                            cannot be undone.</p>
                        <Grid
                            container="container"
                            style={{
                                justifyContent: 'flex-end'
                            }}>
                            <Grid
                                className="w-full flex justify-end"
                                item="item"
                                lg={6}
                                md={6}
                                sm={6}
                                xs={6}>
                                <LoonsButton
                                    className="mt-2"
                                    progress={false}
                                    type="submit"
                                    startIcon="delete"
                                    onClick={() => {
                                        this.setState({ orderDeleteWarning: false });
                                        this.removeOrder()
                                    }}>
                                    <span className="capitalize">Delete</span>
                                </LoonsButton>

                                <LoonsButton
                                    className="mt-2 ml-2"
                                    progress={false}
                                    type="submit"
                                    startIcon={<CancelIcon />}
                                    onClick={() => {
                                        this.setState({ orderDeleteWarning: false });
                                    }}>
                                    <span className="capitalize">Cancel</span>
                                </LoonsButton>
                            </Grid>
                        </Grid>
                    </div>
                </div>
            </Dialog>

            <Dialog
                style={{
                    padding: '10px'
                }}
                maxWidth="lg"
                open={this.state.suggestedWareHous}
                onClose={() => {
                    this.setState({ suggestedWareHous: false })
                }}>
                <div className="w-full h-full px-5 py-5">

                    <Grid container="container">
                        <Grid item="item" lg={12} md={12}>
                            <CardTitle title="Suggeted Warehouse"></CardTitle>
                        </Grid>
                        <Grid
                            item="item"
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginTop: '10px'
                            }}
                            lg={6}
                            md={6}>
                            {EstimateConsumption}
                        </Grid>
                        <Grid item="item" lg={6} md={6}>
                            {OrderQTY}
                        </Grid>
                        <Grid item="item" lg={12} md={12} xs={12} className="mt-10">
                            {SuggestedTable}
                        </Grid>
                        <Grid item="item" lg={12} md={12} xs={12} className="flex justify-end mt-6">
                            <Button
                                startIcon={<CancelIcon />}
                                onClick={() => {
                                    this.setState({ suggestedWareHous: false })
                                }}
                                style={{
                                    backgroundColor: 'red',
                                    color: 'white'
                                }}>Cancel</Button>
                            <Button
                                className="ml-2"
                                startIcon={<ShoppingCartIcon size="medium" />}
                                color="warning"
                                onClick={() => {
                                    if (this.state.addSuggestedWareHouseCart.order_item_details.length != 0) {
                                        this.addSuggested()
                                    } else {
                                        this.addtocart()
                                    }

                                    this.setState({ suggestedWareHous: false })
                                }}
                                style={{
                                    backgroundColor: 'green',
                                    color: 'white'
                                }}>Add to Cart</Button>
                        </Grid>
                    </Grid>
                </div>

            </Dialog>

            <Dialog
                maxWidth="lg"
                open={this.state.instituteIndividual}
                onClose={() => {
                    // this.setState({orderDeleteWarning: false})
                }}>
                <div className="w-full h-full px-5 py-5">
                    <Grid container="container">
                        <Grid item="item" lg={12} md={12} xs={12} className="mb-4">
                            <Grid container style={{ display: 'flex' }} >
                                <Grid item="item" lg={12} md={12} xs={12}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <CardTitle title={"Institute Code: " + this.state.instituteData[this.state.selectedInstitute].insCode}></CardTitle>
                                        <CardTitle title={"Institute Name: " + this.state.instituteData[this.state.selectedInstitute].institute}></CardTitle>
                                        <IconButton aria-label="close" onClick={() => { this.setState({ instituteIndividual: false }) }}><CloseIcon /></IconButton>
                                    </div>
                                </Grid>
                                <Grid item="item" lg={12} md={12} xs={12}>
                                    <LoonsCard>
                                        <Divider className='mb-4' />
                                        <ReactEcharts option={this.state.options} />
                                    </LoonsCard>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
            </Dialog>

            <Dialog
                maxWidth="xl" fullWidth
                open={this.state.instituteConsumption}
                onClose={() => {
                    // this.setState({instituteConsumption: false})
                }}>
                <div className="w-full h-full px-5 py-5">
                    <Grid container="container">
                        <Grid item="item" lg={12} md={12} xs={12} className="mb-4">

                            <LoonsCard >
                                <Grid container style={{ display: 'flex' }}>
                                    <Grid item="item" lg={12} md={12} xs={12}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <CardTitle title={this.state.loaded && this.state.data[this.state.selectedItem] != undefined ? "Institutes Consumption: " + this.state.data[this.state.selectedItem].item_name : "N/A"}></CardTitle>
                                            <IconButton aria-label="close" onClick={() => { this.setState({ instituteConsumption: false }) }}><CloseIcon /></IconButton>
                                        </div>
                                    </Grid>
                                    <Grid item lg={3}> <font style={{ fontWeight: 'bold' }}>Item Class:</font> {this.state.loaded && this.state.data[this.state.selectedItem] != undefined ? this.state.data[this.state.selectedItem].class : "N/A"}</Grid>
                                    <Grid item lg={3}> <font style={{ fontWeight: 'bold' }}>Item Group:</font>  {this.state.loaded && this.state.data[this.state.selectedItem] != undefined ? this.state.data[this.state.selectedItem].group : "N/A"}</Grid>
                                    <Grid item lg={3}> <font style={{ fontWeight: 'bold' }}>Item Category:</font>  {this.state.loaded && this.state.data[this.state.selectedItem] != undefined ? this.state.data[this.state.selectedItem].category : "N/A"}</Grid>
                                    <Grid item lg={3}> <font style={{ fontWeight: 'bold' }}>Item Ven:</font>  {this.state.loaded && this.state.data[this.state.selectedItem] != undefined ? this.state.data[this.state.selectedItem].ven : "N/A"}</Grid>
                                    <Grid item lg={3}> <font style={{ fontWeight: 'bold' }}>Item Min Stock Level:</font>  {this.state.loaded && this.state.data[this.state.selectedItem] != undefined ? this.state.data[this.state.selectedItem].minimum_stock_level : "N/A"}</Grid>
                                </Grid>
                                <div className="mb-8" ></div>
                                <Grid container style={{ display: 'flex', alignItems: "center" }} spacing={2}>
                                    <Grid item>Set Consumption Time Period: </Grid>
                                    <Grid item>
                                        <DatePicker className="w-full"
                                            value={this.state.instituteConsumptionData.from}
                                            placeholder="From"
                                            // minDate={new Date()}
                                            // maxDate={new Date()}
                                            // required={true}

                                            // errorMessages="this field is required"
                                            onChange={(date) => {
                                                let instituteConsumptionData = this.state.instituteConsumptionData
                                                instituteConsumptionData.from = date
                                                this.setState({
                                                    instituteConsumptionData
                                                })
                                            }}
                                        />
                                    </Grid>
                                    <Grid item>To: </Grid>
                                    <Grid item>
                                        <DatePicker className="w-full"
                                            value={this.state.instituteConsumptionData.to}
                                            placeholder="To"
                                            minDate={this.state.instituteConsumptionData.from}
                                            // maxDate={new Date()}
                                            // required={true}

                                            // errorMessages="this field is required"
                                            onChange={(date) => {
                                                let instituteConsumptionData = this.state.instituteConsumptionData
                                                instituteConsumptionData.to = date
                                                this.setState({
                                                    instituteConsumptionData
                                                })
                                                // this.state.instituteConsumptionData.from = date
                                            }}
                                        />
                                    </Grid>
                                    <Grid>
                                        <Grid className='flex justify-start' item lg={12} md={12} sm={12} xs={12}>
                                            <LoonsButton
                                                className='' progress={false}
                                                // type="submit"
                                                // startIcon="save"
                                                onClick={
                                                    () => {
                                                        //some methods to filter
                                                    }
                                                }
                                            >
                                                <span className="capitalize">
                                                    Generate
                                                </span>
                                            </LoonsButton>
                                        </Grid>
                                        {/* <LoonsButton></LoonsButton> */}
                                    </Grid>
                                </Grid>
                                <Grid item lg={12} md={12} xs={12} style={{ display: 'flex', alignItems: "center", justifyContent: 'flex-end' }}>
                                    <ValidatorForm>
                                        <TextValidator className='' placeholder="Search"
                                            //variant="outlined"
                                            fullWidth="fullWidth" variant="outlined" size="small"
                                            value={this.state.instituteConsumptionData.search}
                                            onChange={(e, value) => {
                                                let instituteConsumptionData = this.state.instituteConsumptionData
                                                if (e.target.value != '') {
                                                    instituteConsumptionData.search = e.target.value;
                                                } else {
                                                    instituteConsumptionData.search = null
                                                }
                                                this.setState({ instituteConsumptionData })
                                                console.log("form dat", this.state.instituteConsumptionData)
                                            }}

                                            // onKeyPress={(e) => {
                                            //     if (e.key == "Enter") {                                            
                                            //             this.loadOrderList()            
                                            //     }            
                                            // }}
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

                                    </ValidatorForm>
                                </Grid>
                                <Grid item lg={12} md={12} xs={12}>
                                    <LoonsTable
                                        data={this.state.instituteData}
                                        columns={this.state.instituteColumns}
                                    />
                                </Grid>
                            </LoonsCard>
                        </Grid>
                    </Grid>
                </div>
            </Dialog>

            <Dialog
                style={{
                    padding: '10px'
                }}
                maxWidth="lg"
                open={this.state.individualView}
                onClose={() => {
                    // this.setState({individualView: false})
                }}>
                <div className="w-full h-full px-5 py-5">
                    <Grid container="container">
                        <Grid item="item" lg={12} md={12} xs={12} className="mb-4">

                            <LoonsCard >
                                <Grid container style={{ display: 'flex' }}>
                                    <Grid item="item" lg={12} md={12} xs={12}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <CardTitle title={this.state.loaded && this.state.data[this.state.selectedItem] != undefined ? this.state.data[this.state.selectedItem].item_name : "N/A"}></CardTitle>
                                            <IconButton aria-label="close" onClick={() => { this.setState({ individualView: false }) }}><CloseIcon /></IconButton>
                                        </div>
                                    </Grid>
                                    <Grid item lg={3}> <font style={{ fontWeight: 'bold' }}>Item Class:</font> {this.state.loaded && this.state.data[this.state.selectedItem] != undefined ? this.state.data[this.state.selectedItem].class : "N/A"}</Grid>
                                    <Grid item lg={3}> <font style={{ fontWeight: 'bold' }}>Item Group:</font>  {this.state.loaded && this.state.data[this.state.selectedItem] != undefined ? this.state.data[this.state.selectedItem].group : "N/A"}</Grid>
                                    <Grid item lg={3}> <font style={{ fontWeight: 'bold' }}>Item Category:</font>  {this.state.loaded && this.state.data[this.state.selectedItem] != undefined ? this.state.data[this.state.selectedItem].category : "N/A"}</Grid>
                                    <Grid item lg={3}> <font style={{ fontWeight: 'bold' }}>Item Ven:</font>  {this.state.loaded && this.state.data[this.state.selectedItem] != undefined ? this.state.data[this.state.selectedItem].ven : "N/A"}</Grid>
                                    <Grid item lg={3}> <font style={{ fontWeight: 'bold' }}>Item Min Stock Level:</font>  {this.state.loaded && this.state.data[this.state.selectedItem] != undefined ? this.state.data[this.state.selectedItem].minimum_stock_level : "N/A"}</Grid>
                                </Grid>

                            </LoonsCard>

                            <div className="mb-1" ></div>

                            <div className="mb-2" ></div>
                            <LoonsCard>
                                <Grid container="container">
                                    <Grid item="item" lg={12} md={12} xs={12} className="flex justify-end mt-2">
                                        <Button
                                            startIcon={<CancelIcon />}
                                            onClick={() => {
                                                this.setState({ individualView: false })
                                            }}
                                            style={{
                                                backgroundColor: 'red',
                                                color: 'white'
                                            }}>Cancel</Button>

                                        {
                                            this.state.cartStatus.length != 0
                                                ? <Button
                                                    disabled={this
                                                        .state
                                                        .cartStatus[this.state.selectedItem]
                                                        .buttonState}
                                                    className="ml-2"
                                                    startIcon={<ShoppingCartIcon size="medium" />}
                                                    color="warning"
                                                    onClick={() => {
                                                        if (this.state.itemTotalQty == '' || this.state.itemTotalQty == 0 || this.state.itemTotalQty == null) {
                                                            this.setState({
                                                                message: "Please Enter a value before adding to Cart",
                                                                alert: true,
                                                                severity: "Error"
                                                            })
                                                        } else {
                                                            let message = this.state.message
                                                            if (message == "Low stocks in the selected Warehouse") {
                                                                this.setState({ lowStockWarning: true, alert: true })
                                                            } else if (message == "Expiring stocks in the Selected Warehouse") {
                                                                this.setState({ expiredStockWarning: true, alert: true })
                                                            } else if (message == "Some Values are not loaded to the database") {
                                                                this.setState({ alert: true })
                                                            } else {
                                                                if (this.state.addSuggestedWareHouseCart.order_item_details.length != 0) {
                                                                    this.addSuggested()
                                                                } else {
                                                                    this.addtocart()
                                                                }
                                                            }
                                                            this.setState({ individualView: false })
                                                        }
                                                    }}
                                                    style={{
                                                        backgroundColor: this
                                                            .state
                                                            .cartStatus[this.state.selectedItem]
                                                            .color,
                                                        color: 'white'
                                                    }}>{
                                                        this
                                                            .state
                                                            .cartStatus[this.state.selectedItem]
                                                            .tooltip
                                                    }</Button>
                                                : <Button
                                                    className="ml-2"
                                                    startIcon={<ShoppingCartIcon size="medium" />}
                                                    color="warning"
                                                    onClick={() => {
                                                        if (this.state.itemTotalQty == '' || this.state.itemTotalQty == 0 || this.state.itemTotalQty == null) {
                                                            this.setState({
                                                                message: "Please Enter a value before adding to Cart",
                                                                alert: true,
                                                                severity: "Error"
                                                            })
                                                        } else {
                                                            if (this.state.addSuggestedWareHouseCart.order_item_details.length != 0) {
                                                                this.addSuggested()

                                                            } else {
                                                                this.addtocart()
                                                            }
                                                            this.setState({ individualView: false })
                                                        }
                                                        console.log('itemtotal', this.state.itemTotalQty);
                                                    }}
                                                    style={{
                                                        backgroundColor: 'green',
                                                        color: 'white'
                                                    }}>Add to Cart11</Button>
                                            // <Button         disabled="true"         className="ml-2"
                                            // startIcon={<ShoppingCartIcon size = "medium" />}         color="warning"
                                            // style={{             backgroundColor: 'grey',             color: 'white'
                                            // }}>Added to Cart</Button>
                                        }

                                    </Grid>
                                    <Grid item="item" lg={12} md={12} xs={12}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <CardTitle title="Suggested Warehouse"></CardTitle>
                                        </div>
                                    </Grid>
                                    <Grid
                                        item="item"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            marginTop: '10px'
                                        }}
                                        lg={6}
                                        md={6}>
                                        {EstimateConsumption}
                                    </Grid>
                                    <Grid item="item" lg={6} md={6}>
                                        {OrderQTY}
                                    </Grid>
                                    <Grid item="item" lg={12} md={12} xs={12} className="mt-10">
                                        {SuggestedTable}
                                    </Grid>
                                </Grid>
                            </LoonsCard>
                        </Grid>

                        <Grid item="item" lg={6} md={6} xs={12} className="pr-2">
                            <LoonsCard>
                                <Grid
                                    container="container"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}>
                                    <Grid item="item" lg={6} md={6} xs={4}>
                                        <Typography variant="h6" className="font-semibold">Pending Orders</Typography>
                                    </Grid>
                                    <Grid
                                        item="item"
                                        lg={6}
                                        md={6}
                                        xs={4}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                        Due On Order Qty : {(this.state.orderItemDataTot.length > 0 ? (this.state.isConvertedOrderUom ? (roundDecimal(this.state.orderItemDataTot[0].request_quantity * this.state.ConvertedOrderUomQty, 2) + ' ' + this.state.disUnit) : roundDecimal(this.state.orderItemDataTot[0].request_quantity, 2)) : 0)}
                                    </Grid>
                                </Grid>
                                <Divider className='mb-4' />

                                {this.state.updateQty ?

                                    <div>
                                        {/* show hide table content */}
                                        <Button onClick={this.toggleTableVisibilityPO}>{buttonNamePO}</Button>
                                        {this.state.isTableVisiblePO && (
                                            <LoonsTable
                                                //title={"All Aptitute Tests"}
                                                id={'allAptitute'}
                                                data={this.state.orderItemData}
                                                columns={this.state.consumption} options={{
                                                    filterType: 'textField',
                                                    pagination: true,
                                                    size: 'medium',
                                                    serverSide: true,
                                                    print: false,
                                                    viewColumns: false,
                                                    download: false,
                                                    count: this.state.totalItems2,
                                                    rowsPerPage: this.state.formData3.limit,
                                                    page: this.state.formData3.page,
                                                    onTableChange: (action, tableState) => {
                                                        console.log(action, tableState)
                                                        switch (action) {
                                                            case 'changePage':
                                                                this.setPageOrderItem(tableState.page)
                                                                break
                                                            case 'sort':
                                                                //this.sort(tableState.page, tableState.sortOrder);
                                                                break
                                                            default:
                                                                console.log('action not handled.')
                                                        }
                                                    }
                                                }}></LoonsTable>

                                        )}
                                    </div>

                                    :
                                    (
                                        //loading effect
                                        <Grid className="justify-center text-center w-full pt-12">
                                            <CircularProgress size={30} />
                                        </Grid>
                                    )}
                            </LoonsCard>
                        </Grid>

                        <Grid item="item" lg={6} md={6} xs={12} className="pl-2">
                            <LoonsCard>
                                <Grid container="container">
                                    <Grid item="item" lg={6} md={6} xs={4}>
                                        <Typography variant="h6" className="font-semibold">My Stock</Typography>
                                    </Grid>
                                    <Grid
                                        item="item"
                                        lg={3}
                                        md={3}
                                        xs={4}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                        Total Stock Qty: {this.state.updateQty ? this.state.batchTotal.length : "N/A"}
                                    </Grid>
                                    <Grid
                                        item="item"
                                        lg={3}
                                        md={3}
                                        xs={4}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                        Total Serviceable ty: {this.state.updateQty ? this.state.batchTotal.reduce((partialSum, a) => partialSum + a, 0) : "N/A"}
                                    </Grid>
                                </Grid>
                                <Divider className='mb-4' />

                                <div>
                                    {/* show hide table content */}
                                    <Button onClick={this.toggleTableVisibility}>{buttonName}</Button>
                                    {this.state.isTableVisible && (
                                        <LoonsTable
                                            //title={"All Aptitute Tests"}
                                            id={'allAptitute'}
                                            data={this.state.myStockData}
                                            columns={this.state.myStockCols} options={{
                                                filterType: 'textField',
                                                pagination: true,
                                                size: 'medium',
                                                serverSide: true,
                                                print: false,
                                                viewColumns: false,
                                                download: false,
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
                                                            console.log('action not handled.')
                                                    }
                                                }
                                            }}></LoonsTable>
                                    )}
                                </div>

                            </LoonsCard>
                        </Grid>
                        <div className="mt-4" ></div>
                        {/* <Grid item="item" lg={6} md={6} xs={12} className="pr-2">
                            <LoonsButton className="mt-4" size="large" style={{ width: '100%' }}
                                onClick={() => {
                                    this.setState({
                                        individualView: false,
                                        instituteConsumption: true
                                    })
                                }}
                            >View Institute Wise Consumption</LoonsButton>
                        </Grid> */}


                    </Grid>
                </div>

                {/*  <individualView  consumpEstimate={this.state.consumpEstimate} orderQty={this
 *  .state.orderQty} rows={this.state.rows} options={this.state.options} myStock
 * D ata={this.state.myStockData} myStockCols={this.state.myStockCols} addtocart
 * ={ this.addtocart} severity={this.state.severity} />

 */
                }
            </Dialog>




            <Dialog fullWidth maxWidth="lg " open={this.state.showItemBatch}
                onClose={() => {
                    this.setState({ showItemBatch: false })
                }}  >
                <MuiDialogTitle disableTypography className={classes.Dialogroot}>
                    <CardTitle title="Item Batch Info" />
                    <IconButton aria-label="close" className={classes.closeButton}
                        onClick={() => {
                            this.setState({ showItemBatch: false })
                        }}>
                        <CloseIcon />
                    </IconButton>
                </MuiDialogTitle>
                <div className="w-full h-full px-5 py-5">
                    <ItemsBatchView id={this.state.selected_item_id} warehouse_id={this.state.item_warehouse_id}></ItemsBatchView>
                </div>
            </Dialog>



            <Dialog maxWidth="md" fullWidth={true} open={this.state.showAddRemark}
                onClose={() => {
                    this.setState({ showAddRemark: false })
                }}  >
                <MuiDialogTitle disableTypography className={classes.Dialogroot}>
                    <CardTitle title="Add Remark" />
                    <IconButton aria-label="close" className={classes.closeButton}
                        onClick={() => {
                            this.setState({ showAddRemark: false })
                        }}>
                        <CloseIcon />
                    </IconButton>
                </MuiDialogTitle>
                <div className=" px-5 py-5">
                    <Alert severity='info'>
                        <strong>Added quantity was more than estimated quantity. Please add remark for create supplementary order.</strong>
                    </Alert>
                    <ValidatorForm onSubmit={() => {
                        this.addtocart()
                    }}>
                        <TextValidator
                            className=" w-full"
                            placeholder="Remark"
                            name="Remark"
                            InputLabelProps={{ shrink: false }}
                            value={this.state.cartStatus[this.state.remarkAddedIndex]?.remarks}
                            type="text"
                            variant="outlined"
                            size="small"
                            onChange={(e) => {
                                let cartStatus = this.state.cartStatus
                                cartStatus[this.state.remarkAddedIndex].remarks = e.target.value
                                this.setState({ cartStatus })
                            }}
                            validators={['required']}
                            errorMessages={[
                                'this field is required',
                            ]}
                        />

                        <LoonsButton
                            className="mt-5"
                            //startIcon={<CancelIcon />}
                            type="submit"
                        >Add To Cart</LoonsButton>
                    </ValidatorForm>
                </div>
            </Dialog>




            {/* <Dialog fullWidth maxWidth="sm" open={this.state.dialog_for_select_warehouse} >

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
                                        this.state.formData.owner_id = value.owner_id
                                        this.state.genOrder.warehouse_id = value.id
                                        this.state.getCartItems.warehouse_id = value.id
                                        this.state.suggestedWareHouses.warehouse_id = value.id

                                        this.setState({ owner_id: value.owner_id,selected_warehouse:value.id ,dialog_for_select_warehouse:false, warehouseSelectDone:true})
                                        localStorageService.setItem('pharmacist_warehouse', value);
                                        this.loadOrderList() 
                                    }
                                }}
                                value={{
                                    name: this.state.selected_warehouse ? (this.state.all_warehouse_loaded.filter((obj) => obj.id == this.state.selected_warehouse).name) : null,
                                    id: this.state.selected_warehouse
                                }}
                                getOptionLabel={(option) => option.name}
                                renderInput={(params) => (
                                    <TextValidator
                                        {...params}
                                        placeholder="Select Your Front Desk"                                        
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            />

                        </ValidatorForm>
                    </div>
                </Dialog> */}

            <LoonsSnackbar
                open={this.state.alert}
                onClose={() => {
                    this.setState({ alert: false })
                }}
                message={this.state.message}
                autoHideDuration={3000}
                severity={this.state.severity}
                elevation={2}
                variant="filled"></LoonsSnackbar>
        </Fragment>
        )
    }
}

export default withStyles(styleSheet)(MDS_Create_Orders)