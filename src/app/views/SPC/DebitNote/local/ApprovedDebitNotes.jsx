import React, { Component, Fragment, useState } from 'react'
import { withStyles, styled } from '@material-ui/core/styles'
import { TextValidator } from 'react-material-ui-form-validator'
import { ValidatorForm } from 'app/components/LoonsLabComponents'
import {
    Grid,
    Dialog,
    IconButton,
    Icon,
    Tooltip,
    CircularProgress,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField
} from '@material-ui/core'
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import { Autocomplete } from '@material-ui/lab'
import 'date-fns'

import {
    DatePicker,
    Button,
    LoonsSnackbar,
    CardTitle,
    SubTitle,
    LoonsTable,
} from 'app/components/LoonsLabComponents'
import { dateParse, convertTocommaSeparated } from 'utils'

import HospitalConfigServices from 'app/services/HospitalConfigServices';
import InventoryService from 'app/services/InventoryService';

import CloseIcon from '@material-ui/icons/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

import localStorageService from 'app/services/localStorageService'

import LocalDetails from "./ApprovalDetails"
import SPCServices from 'app/services/SPCServices'
import PendingDebitNoteDetailsView from './PendingDebitNoteDetailsView'
import FinanceDocumentServices from 'app/services/FinanceDocumentServices'
import moment from 'moment'


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
})


class ApprovedDebitNotes extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeStep: 1,
            isOverflow: false,
            role: null,
            open: false,
            viewDet: false,
            consignmentOpen: false,
            approveOpen: false,
            rejectOpen: false,
            forwardOpen: false,
            isReject: false,
            isForward: false,
            sequence: 0,
            Debut_note_status_List: null,
            Shipment_status_List: null,
            selected_data: '',
            itemList: [],
            // single_data:{},
            single_data: [
                {
                    id: "A1001",
                    ItemSnap: {
                        sr_no: "00100148",
                        short_description: "Panadol",
                    },
                    available_qty: "250",
                    order_qty: null
                },
                {
                    id: "A1002",
                    ItemSnap: {
                        sr_no: "00100149",
                        short_description: "Atrolip",
                    },
                    available_qty: "350",
                    order_qty: null
                },
            ],
            selected_id: null,
            collapseButton: 0,
            userRoles: [],

            data: [
                {
                    ldcn_ref_no: "03145",
                    po_no: "12345",
                    ldcn_date: new Date(),
                    ldcn_no: "LCDN001",
                    invoice_no: "CHE1234",
                    supplier_code: "AB1234",
                    grn_no: "06074",
                    shipment_status: "Completed",
                    debit_status: "Not Checked",
                    total: "7500",
                },
                {
                    ldcn_ref_no: "01378",
                    po_no: "22445",
                    ldcn_date: new Date(),
                    ldcn_no: "LCDN002",
                    invoice_no: "CHE1222",
                    supplier_code: "AB2345",
                    grn_no: "Pending",
                    shipment_status: "In Transit",
                    debit_status: "Not Checked",
                    total: "10000",
                },
                {
                    ldcn_ref_no: "01388",
                    po_no: "22345",
                    ldcn_date: new Date(),
                    ldcn_no: "LCDN003",
                    invoice_no: "CHE1234",
                    supplier_code: "AB2355",
                    grn_no: "Pending",
                    shipment_status: "In Transit",
                    debit_status: "Not Checked",
                    total: "10500",
                },
            ],
            columns: [
                {
                    name: 'action',
                    label: 'Action',
                    options: {
                        display: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            let id = this.state.data[tableMeta.rowIndex]?.id
                            let sequence = (tableMeta.rowIndex) % 3;
                            return (
                                <>

                                    <Tooltip title="View Debit Note">
                                        <IconButton
                                            className="text-black mr-2"
                                            onClick={() => {
                                                this.setState({ viewDet: true, sequence: sequence, selected_id: id, selected_data: this.state.data[tableMeta.rowIndex] })
                                            }}
                                        >
                                            <Icon color='primary'>visibility</Icon>
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Print Debit Note">
                                        <IconButton
                                            className="text-black"
                                            onClick={() => {
                                                this.printData(id)
                                            }}
                                        >
                                            <Icon color='primary'>print</Icon>
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )
                        },
                    },
                },
                {
                    name: 'debit_note_no', // field name in the row object
                    label: 'Debit Note No', // column title that will be shown in table
                    options: {
                        filter: true,
                        display: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return (
                                <p>{this.state.data[tableMeta.rowIndex]?.debit_note_no}</p>
                            )
                        }
                    },
                },
                {
                    name: 'wdn_no',
                    label: 'WDN No',
                    options: {
                        display: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return (
                                <p>{this.state.data[tableMeta.rowIndex]?.Consignment?.wdn_no}</p>
                            )
                        }
                    },
                },
                {
                    name: 'invoice_no',
                    label: 'Invoice No',
                    options: {
                        display: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return (
                                <p>{this.state.data[tableMeta.rowIndex]?.Consignment?.invoice_no}</p>
                            )
                        }
                    },
                },
                // {
                //     name: 'shipment_no', // field name in the row object
                //     label: 'Wharf Ref No', // column title that will be shown in table
                //     options: {
                //         display: true,
                //         customBodyRender: (value, tableMeta, updateValue) => {
                //             return (
                //                 <p>{this.state.data[tableMeta.rowIndex]?.Consignment?.wharf_ref_no}</p>
                //             )
                //         }
                //     },
                // },
                {
                    name: 'po_no',
                    label: 'PO No',
                    options: {
                        display: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return (
                                <p>{this.state.data[tableMeta.rowIndex]?.Consignment?.po_no}</p>
                            )
                        }
                    },
                },
                {
                    name: 'debit_note_date',
                    label: 'Debit Note Date',
                    options: {
                        display: true,
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return (
                                <p>{dateParse(this.state.data[tableMeta.rowIndex]?.createdAt)}</p>
                            )
                        }
                    },
                },

                // {
                //     name: 'invoice_no',
                //     label: 'Invoice No',
                //     options: {
                //         display: true,
                //         // filter: true,
                //         customBodyRender: (value, tableMeta, updateValue) => {
                //             return (
                //                 <p>{this.state.data[tableMeta.rowIndex]?.Consignment?.invoice_no}</p>
                //             )
                //         }
                //     },
                // },
                // {
                //     name: 'supplier_code',
                //     label: 'Supplier',
                //     options: {
                //         display: true,
                //         customBodyRender: (Supplier) => Supplier?.registration_no ? Supplier?.registration_no : "N/A"
                //     },
                // },
                // {
                //     name: 'grn_no',
                //     label: 'GRN No',
                //     options: {
                //         display: true,
                //         // filter: true,
                //     },
                // },
                {
                    name: 'shipment_status',
                    label: 'Shipment Status',
                    options: {
                        display: true,
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return (
                                <p>{this.state.data[tableMeta.rowIndex]?.Consignment?.status}</p>
                            )
                        }
                    },
                },
                {
                    name: 'debit_status',
                    label: 'Debit Note Status',
                    options: {
                        display: true,
                        // filter: true,
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return (
                                <p>{this.state.data[tableMeta.rowIndex]?.status}</p>
                            )
                        }
                    },
                },
                // {
                //     name: 'total',
                //     label: 'Order Total',
                //     options: {
                //         display: true,
                //         customBodyRender: (value, tableMeta, updateValue) => {
                //             return (
                //                 <p>{convertTocommaSeparated(this.state.data[tableMeta.rowIndex]?.Consignment?.total, 2)}</p>
                //             )
                //         }
                //     },
                // },
            ],

            alert: false,
            message: '',
            severity: 'success',

            // loading: false,
            // single_loading: false,
            storedData: {},

            loading: true,
            single_loading: true,

            totalItems: 0,
            filterData: {
                shipment_no: null,
                wharf_ref_no: null,
                ldcn_ref_no: null,
                delivery_from: null,
                delivery_to: null,
                due_from: null,
                due_to: null,
                ldcn_from: null,
                ldcn_to: null,
                ldcn_no: null,
                po_no: null,
                invoice_no: null,
                debit_status: null,
                debit_status_id: null,
                shipment_status: null,
                shipment_status_id: null,
                limit: 20,
                page: 0,
                'order[0]': ['updatedAt', 'DESC'],
                status: ["APPROVED"],
                debit_note_type: "Local",
            },
            isLocal: true,

            consultant: [
                { id: 1, label: 'Haris' },
                { id: 2, label: 'Sadun' },
                { id: 3, label: 'Ishara' },
                { id: 4, label: 'Gayan' },
            ],

            formSampleData: {
                isLocal: null,
            },

            formData: {
                limit: 20,
                page: 0,
                'order[0]': ['updatedAt', 'DESC'],
                type: "Local",
                status: ["APPROVED", "SUPERVISOR APPROVED"],
                // item_id: this.props.match.params.item_id
                // item_id: this.props.match.params.item_id
            },

            all_Suppliers: [],
            all_manufacture: [],

            formSingleData: {
                order_qty: null,
                po_by: "HOSPITAL",
                order_no: null,
                supplier_id: null,
                manufacture_id: null,
                lp_request_id: null,
                order_date: null,
                status: "Active",
                type: "lprequest",
                created_by: null,
                order_date_to: null,
                no_of_items: null,
                estimated_value: null,
                order_for_year: null,
                order_items: [],
                agent_id: 'd13941b2-7b77-42e7-ae5a-f07f9143a5dc',

                currency: "LKR",
                indent_no: null,
                // item_id: this.props.match.params.item_id
            },
        }
        this.loadSingleData = this.loadSingleData.bind(this)
    }

    printData = async (id) => {
        try {
            let params = {
                refference_id: id,
                reference_type: ['SPC LC Debit Note'],
                is_active: true,
            };

            let res_data = await FinanceDocumentServices.getFinacneDocuments(params);
            console.log("Pdf", res_data.data.view.data[0]?.template);

            var searchString = 'catch_and_edit';
            var inputString = res_data.data.view.data[0]?.template;

            const currentTime = moment().format('YYYY-MM-DD hh:mm A');
            var outputString = inputString.replace(searchString, currentTime);

            // Create a new hidden iframe
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            // Write the modified template content to the iframe
            iframe.contentDocument.write(outputString);
            iframe.contentDocument.close();

            // Wait for the iframe to load and trigger the print
            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow.print();
                    document.body.removeChild(iframe); // Remove the iframe after printing
                }, 1000); // Adjust the delay as needed
            };

            if (res_data.status === 200) {
                this.setState({
                    dabitNote: outputString,
                    debitNoteView: true,
                });
            }
        } catch (error) {
            console.error('Error fetching or printing:', error);
        }
    };

    loadData = async () => {
        //function for load initial data from backend or other resources
        this.setState({ loading: false });
        // let formData = this.state.filterData;
        const formData = { ...this.state.filterData, status: ['APPROVED', "SUPERVISOR APPROVED"], type: "SPC LC Debit Note" }

        // const formData = { ...this.state.formData, status: ['APPROVED'], type: "LOCAL" }
        //const formData = { ...this.state.formData }

        let res = await SPCServices.getAllDebitNotes(formData)

        if (res.status === 200) {
            console.log('LDCN Data: ', res.data.view.data);
            this.setState({ data: res.data.view.data, totalItems: res.data.view.totalItems })
        }

        this.setState({ loading: true })
    }


    getDebitNoteStatus = async () => {

        let res = await SPCServices.getAllDebitNotes(this.state.filterData)

        if (res.status === 200) {
            let list = res.data.view.data.map((dataset) => dataset?.status)
            let uniquitemslist = [...new Set(list)]

            console.log('chcking uniq list', uniquitemslist)
            this.setState({ Debut_note_status_List: uniquitemslist })
        }
    }

    // getShipmentStatus = async () => {

    //     let res = await SPCServices.getAllDebitNotes(this.state.formData)

    //     if (res.status === 200){
    //         this.setState({ Shipment_status_List : true, open: true })
    //     }
    // }

    loadSingleData = async (id) => {
        this.setState({ single_loading: false, open: false });
        let res = await SPCServices.getAllDebitNoteByID(id)

        if (res.status === 200) {
            console.log('LDCN Single Data: ', res.data.view);
            this.setState({ single_data: res.data.view })
        }

        this.setState({ single_loading: true, open: true })
    }

    async loadAllSuppliers(search) {
        let params = { search: search }

        let res = await HospitalConfigServices.getAllSuppliers(params)
        if (res.status) {
            console.log("all Suppliers", res.data.view.data)
            this.setState({
                all_Suppliers: res.data.view.data,

            })
        }
    }

    loadItemData = async () => {
        let formData = this.state.filterData
        if (formData.item_name && formData.item_name.length > 3) {
            let res = await InventoryService.fetchAllItems({ search: formData.item_name,/*  is_prescrible: "true", limit: 10, page: 0, */ 'order[0]': ['sr_no', 'ASC'] })
            if (res.status === 200) {
                this.setState({ itemList: res.data.view.data });
            }
        } else if (formData.sr_no && formData.sr_no.length > 3) {
            let res = await InventoryService.fetchAllItems({ search: formData.sr_no,/*  is_prescrible: "true", limit: 10, page: 0,  */'order[0]': ['sr_no', 'ASC'] })
            if (res.status === 200) {
                this.setState({ itemList: res.data.view.data });
            }
        }
    }

    async loadAllManufacture(search) {
        let params = { search: search }

        let res = await HospitalConfigServices.getAllManufacturers(params)
        if (res.status) {
            console.log("all Manufacturers", res.data.view.data)
            this.setState({
                all_manufacture: res.data.view.data,

            })
        }
    }

    async setPage(page) {
        //Change paginations
        let formData = this.state.filterData
        formData.page = page
        this.setState({
            formData
        }, () => {
            console.log("New Form Data: ", this.state.formData)
            this.loadData()
        })
    }


    handleDataStore = (data) => {
        this.setState((prevState) => {
            // Merge the new data with the previous state
            const updatedData = { ...prevState.storedData, ...data };
            return { storedData: updatedData };
        });
    };

    async submitData() { }

    handleFileSelect = (event) => {
        const { selectedFiles, selectedFileList } = this.props
        let files = event.target.files

        this.setState({ files: files }, () => {
            console.log('files', this.state.files)
        })
    }

    componentDidMount() {
        let roles = localStorageService.getItem('userInfo')?.roles
        this.setState({
            roles: roles[0],
            userRoles: roles
        }, () => {
            this.loadData()
            this.getDebitNoteStatus()
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.storedData !== this.state.storedData) {
            console.log("Data :", this.state.storedData)
        }
    }

    render() {
        let { theme } = this.props
        const { classes } = this.props

        return (
            <Fragment>
                {/* Filtr Section */}
                <ValidatorForm
                    className="pt-2"
                    onSubmit={() => this.setPage(0)}
                    onError={() => null}
                >
                    {/* Main Grid */}
                    <Grid container spacing={2} direction="row">
                        {/* Filter Section */}
                        <Grid item xs={12} className='mb-10' sm={12} md={12} lg={12}>
                            {/* Item Series Definition */}
                            <Grid container spacing={2}>
                                <Grid
                                    item
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    lg={12}
                                >
                                    <Grid container spacing={2}>
                                        <Grid
                                            className=" w-full"
                                            item
                                            lg={4}
                                            md={4}
                                            sm={12}
                                            xs={12}
                                        >
                                            <SubTitle title="WDN Number" />
                                            <TextValidator
                                                className=" w-full"
                                                placeholder="Enter WDN Number"
                                                name="wdn_no"
                                                InputLabelProps={{
                                                    shrink: false,
                                                }}
                                                value={
                                                    this.state.filterData
                                                        .wdn_no
                                                }
                                                type="text"
                                                variant="outlined"
                                                size="small"
                                                onChange={(e) => {
                                                    this.setState({
                                                        filterData: {
                                                            ...this
                                                                .state
                                                                .filterData,
                                                            wdn_no:
                                                                e.target
                                                                    .value,
                                                        },
                                                    })
                                                }}
                                            />
                                        </Grid>
                                        <Grid
                                            className=" w-full"
                                            item
                                            lg={4}
                                            md={4}
                                            sm={12}
                                            xs={12}
                                        >
                                            <SubTitle title="PO Number" />
                                            <TextValidator
                                                className=" w-full"
                                                placeholder="Enter PO Number"
                                                name="po_no"
                                                InputLabelProps={{
                                                    shrink: false,
                                                }}
                                                value={
                                                    this.state.filterData
                                                        .po_no
                                                }
                                                type="text"
                                                variant="outlined"
                                                size="small"
                                                onChange={(e) => {
                                                    this.setState({
                                                        filterData: {
                                                            ...this
                                                                .state
                                                                .filterData,
                                                            po_no:
                                                                e.target
                                                                    .value,
                                                        },
                                                    })
                                                }}
                                            />
                                        </Grid>
                                        <Grid
                                            className=" w-full"
                                            item
                                            lg={4}
                                            md={4}
                                            sm={12}
                                            xs={12}
                                        >
                                            <SubTitle title="Invoice Number" />
                                            <TextValidator
                                                className=" w-full"
                                                placeholder="Enter Invoice Number"
                                                name="invoice_no"
                                                InputLabelProps={{
                                                    shrink: false,
                                                }}
                                                value={
                                                    this.state.filterData
                                                        .invoice_no
                                                }
                                                type="text"
                                                variant="outlined"
                                                size="small"
                                                onChange={(e) => {
                                                    this.setState({
                                                        filterData: {
                                                            ...this
                                                                .state
                                                                .filterData,
                                                            invoice_no:
                                                                e.target
                                                                    .value,
                                                        },
                                                    })
                                                }}
                                            />
                                        </Grid>

                                        <Grid item className='w-full' lg={12} md={12} sm={12} xs={12}>
                                            <Grid container spacing={2}>
                                                {/* <Grid
                                                    className=" w-full"
                                                    item
                                                    lg={4}
                                                    md={4}
                                                    sm={12}
                                                    xs={12}
                                                >
                                                    <SubTitle title="WHARF Ref Number" />
                                                    <TextValidator
                                                        className=" w-full"
                                                        placeholder="Enter WHARF Ref Number"
                                                        name="shipment_no"
                                                        InputLabelProps={{
                                                            shrink: false,
                                                        }}
                                                        value={
                                                            this.state.filterData
                                                                .shipment_no
                                                        }
                                                        type="text"
                                                        variant="outlined"
                                                        size="small"
                                                        onChange={(e) => {
                                                            this.setState({
                                                                filterData: {
                                                                    ...this
                                                                        .state
                                                                        .filterData,
                                                                    shipment_no:
                                                                        e.target
                                                                            .value,
                                                                },
                                                            })
                                                        }}
                                                    />
                                                </Grid> */}
                                                <Grid
                                                    className=" w-full"
                                                    item
                                                    lg={4}
                                                    md={4}
                                                    sm={12}
                                                    xs={12}
                                                >
                                                    <SubTitle title="Shipment Number" />
                                                    <TextValidator
                                                        className=" w-full"
                                                        placeholder="Enter Shipment Number"
                                                        name="wharf_ref_no"
                                                        InputLabelProps={{
                                                            shrink: false,
                                                        }}
                                                        value={
                                                            this.state.filterData
                                                                .wharf_ref_no
                                                        }
                                                        type="text"
                                                        variant="outlined"
                                                        size="small"
                                                        onChange={(e) => {
                                                            this.setState({
                                                                filterData: {
                                                                    ...this
                                                                        .state
                                                                        .filterData,
                                                                    wharf_ref_no:
                                                                        e.target
                                                                            .value,
                                                                },
                                                            })
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid
                                                    className=" w-full"
                                                    item
                                                    lg={4}
                                                    md={4}
                                                    sm={12}
                                                    xs={12}
                                                >
                                                    <SubTitle title="Debit Note Number" />
                                                    <TextValidator
                                                        className=" w-full"
                                                        placeholder="Enter Debit Note Number"
                                                        name="debit_note_no"
                                                        InputLabelProps={{
                                                            shrink: false,
                                                        }}
                                                        value={
                                                            this.state.filterData
                                                                .debit_note_no
                                                        }
                                                        type="text"
                                                        variant="outlined"
                                                        size="small"
                                                        onChange={(e) => {
                                                            this.setState({
                                                                filterData: {
                                                                    ...this
                                                                        .state
                                                                        .filterData,
                                                                    debit_note_no:
                                                                        e.target
                                                                            .value,
                                                                },
                                                            })
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid
                                                    className=" w-full"
                                                    item
                                                    lg={4}
                                                    md={4}
                                                    sm={12}
                                                    xs={12}
                                                >
                                                    <SubTitle title="Status" />
                                                    <Autocomplete


                                                        options={["APPROVED", "SUPERVISOR APPROVED"]}
                                                        getOptionLabel={(option) => option}
                                                        // id="disable-clearable"
                                                        onChange={(event, value) => {
                                                            console.log(value)
                                                            let filterData = this.state.filterData
                                                            if (value) {


                                                                filterData.status = [value]
                                                            } else {
                                                                filterData.status = []
                                                            }

                                                            this.setState({
                                                                filterData,
                                                                selectedStatus: value
                                                            })
                                                        }}
                                                        value={this.state.selectedStatus ?? ""}
                                                        size='small'
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                placeholder='Select Status'
                                                                //variant="outlined"
                                                                fullWidth
                                                                variant="outlined"
                                                                size="small"


                                                            />
                                                        )}

                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid
                                            style={{ display: "flex", height: 'fit-content', alignSelf: "flex-end" }}
                                            item
                                            lg={12}
                                            md={12}
                                            sm={12}
                                            xs={12}
                                        >
                                            <Grid container spacing={2}>
                                                <Grid
                                                    item
                                                    lg={12}
                                                    md={12}
                                                    sm={12}
                                                    xs={12}
                                                    className=" w-full flex justify-end"
                                                >
                                                    {/* Submit Button */}
                                                    <Button
                                                        className="mt-2 mr-2"
                                                        progress={false}
                                                        type="submit"
                                                        scrollToTop={
                                                            true
                                                        }
                                                        startIcon="search"
                                                    //onClick={this.handleChange}
                                                    >
                                                        <span className="capitalize">
                                                            Search
                                                        </span>
                                                    </Button>
                                                    <Button
                                                        className="mt-2 ml-2"
                                                        progress={false}
                                                        type="button"
                                                        scrollToTop={
                                                            true
                                                        }
                                                        startIcon="format_paint"
                                                        onClick={() => {

                                                            let filterData = this.state.filterData
                                                            filterData = {
                                                                ...this.state.filterData,
                                                                wharf_ref_no: "",
                                                                delivery_from: "",
                                                                delivery_to: "",
                                                                due_from: "",
                                                                due_to: "",
                                                                wdn_from: "",
                                                                wdn_to: "",
                                                                wdn_no: '',
                                                                po_no: "",
                                                                invoice_no: "",
                                                                debit_status: "",
                                                                debit_status_id: "",
                                                                debit_note_number: "",
                                                                shipment_status: "",
                                                                shipment_status_id: "",
                                                                shipment_no: "",
                                                                limit: 20,
                                                                page: 0,
                                                                'order[0]': ['updatedAt', 'DESC'],
                                                                status: ["APPROVED", "SUPERVISOR APPROVED"],
                                                                debit_note_type: "Local",

                                                            }

                                                            this.setState({
                                                                filterData: filterData,
                                                                selectedStatus: '',
                                                            }, () => {
                                                                this.loadData()
                                                            })
                                                        }}
                                                    >
                                                        <span className="capitalize">
                                                            Clear Filters
                                                        </span>
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        {/* Submit and Cancel Button */}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <br />
                        {/* Table Section */}
                        {this.state.loading ?
                            <Grid container className="mt-5 pb-5">
                                <Grid item lg={12} md={12} sm={12} xs={12}>
                                    <LoonsTable
                                        //title={"All Aptitute Tests"}
                                        id={'allApprovedPO'}
                                        data={this.state.data}
                                        columns={this.state.columns}
                                        options={{
                                            pagination: true,
                                            rowsPerPage: this.state.filterData.limit,
                                            page: this.state.filterData.page,
                                            serverSide: true,
                                            rowsPerPageOptions: [5, 10, 15, 20, 30, 50, 100],
                                            print: true,
                                            count: this.state.totalItems,
                                            viewColumns: true,
                                            download: true,
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
                                                    case 'changeRowsPerPage':
                                                        this.setState({
                                                            filterData: {
                                                                ...this.state.filterData,
                                                                limit: tableState.rowsPerPage,
                                                                page: 0,
                                                            },
                                                        }, () => {
                                                            this.loadData()
                                                        })
                                                        break;
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
                                </Grid>
                            </Grid>
                            :
                            (
                                <Grid className='justify-center text-center w-full pt-12'>
                                    <CircularProgress size={30} />
                                </Grid>
                            )
                        }
                    </Grid>
                </ValidatorForm>
                <Dialog
                    fullWidth={true}
                    maxWidth="xl"
                    open={this.state.viewDet}>
                    <MuiDialogTitle disableTypography={true} className={classes.Dialogroot}>
                        <CardTitle title="View Debit Note - LDCN" />
                        <IconButton aria-label="close" className={classes.closeButton}
                            onClick={() => {
                                this.setState({ viewDet: false })
                            }}>
                            <CloseIcon />
                        </IconButton>
                    </MuiDialogTitle>
                    <div className="w-full h-full px-4 pb-5">

                        <PendingDebitNoteDetailsView editAccess={true} sequence={this.state.sequence} selected_data={this.state.selected_id} storeData={this.handleDataStore} handleReject={() => this.setState({ rejectOpen: true })} handleClose={() => { this.setState({ viewDet: false }); this.loadData() }} submitOpen={() => this.setState({ forwardOpen: true })} />



                    </div>
                </Dialog>
                <Dialog
                    fullWidth={true}
                    maxWidth="xl"
                    open={this.state.open}>
                    <MuiDialogTitle disableTypography={true} className={classes.Dialogroot}>
                        <CardTitle title="Debit Note Creation - LDCN" />
                        <IconButton aria-label="close" className={classes.closeButton}
                            onClick={() => {
                                this.setState({ open: false })
                            }}>
                            <CloseIcon />
                        </IconButton>
                    </MuiDialogTitle>
                    <div className="w-full h-full px-4 pb-5">
                        <LocalDetails sequence={this.state.sequence} selected_data={this.state.selected_id} data={this.state.selected_data} storeData={this.handleDataStore} handleReject={() => this.setState({ rejectOpen: true })} handleClose={() => this.setState({ open: false })} submitOpen={() => this.setState({ forwardOpen: true })} />
                    </div>
                </Dialog>
                <Dialog fullWidth={true}
                    maxWidth="sm"
                    open={this.state.rejectOpen}>
                    <MuiDialogTitle disableTypography={true} className={classes.Dialogroot}>
                        <CardTitle title="Confirmation Dailog" />
                        <IconButton aria-label="close" className={classes.closeButton}
                            onClick={() => {
                                this.setState({ rejectOpen: false })
                            }}>
                            <CloseIcon />
                        </IconButton>
                    </MuiDialogTitle>
                    <div className="w-full h-full px-4 pb-5">
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Are you sure to reject the Debit Note?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => {
                                this.setState({ rejectOpen: false })
                            }}>No</Button>
                            <Button onClick={() => {
                                this.setState({ rejectOpen: false, isReject: true })
                            }} autoFocus>
                                Yes
                            </Button>
                        </DialogActions>
                    </div>
                </Dialog>
                <Dialog fullWidth={true}
                    maxWidth="sm"
                    open={this.state.isForward}>
                    <MuiDialogTitle disableTypography={true} className={classes.Dialogroot}>
                        <CardTitle title="Confirmation Message" />
                        <IconButton aria-label="close" className={classes.closeButton}
                            onClick={() => {
                                this.setState({ isForward: false })
                            }}>
                            <CloseIcon />
                        </IconButton>
                    </MuiDialogTitle>
                    <div className="w-full h-full px-4 pb-5">
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {this.state.sequence === 0 ? "You have successfully forwarded the Debit Note to the supervisor" : this.state.sequence === 1 ? "You have successfully forwarded the Debit Note to the Manager" : "You have successfully approved the Debit Note"}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            {this.state.sequence === 0 &&
                                <Button
                                    startIcon="print"
                                    onClick={() => {
                                        this.setState({ isForward: false, open: false })
                                    }}>Print</Button>
                            }
                            <Button onClick={() => {
                                this.setState({ isForward: false, open: false })
                            }}>Done</Button>
                        </DialogActions>
                    </div>
                </Dialog>
                <Dialog fullWidth={true}
                    maxWidth="sm"
                    open={this.state.isReject}>
                    <MuiDialogTitle disableTypography={true} className={classes.Dialogroot}>
                        <CardTitle title="Confirmation Message" />
                        <IconButton aria-label="close" className={classes.closeButton}
                            onClick={() => {
                                this.setState({ isReject: false })
                            }}>
                            <CloseIcon />
                        </IconButton>
                    </MuiDialogTitle>
                    <div className="w-full h-full px-4 pb-5">
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                You have successfully rejected the Debit Note and returned it
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => {
                                this.setState({ isReject: false, open: false })
                            }}>Done</Button>
                        </DialogActions>
                    </div>
                </Dialog>
                <LoonsSnackbar
                    open={this.state.alert}
                    onClose={() => {
                        this.setState({ alert: false })
                    }}
                    message={this.state.message}
                    autoHideDuration={1200}
                    severity={this.state.severity}
                    elevation={2}
                    variant="filled"
                ></LoonsSnackbar>
            </Fragment>
        )
    }
}

export default withStyles(styleSheet)(ApprovedDebitNotes)
