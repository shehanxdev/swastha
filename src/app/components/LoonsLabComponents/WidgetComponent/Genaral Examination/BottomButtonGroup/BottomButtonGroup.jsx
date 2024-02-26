import React from 'react'
import { Grid } from '@material-ui/core'
import { Button } from 'app/components/LoonsLabComponents'

export const BottomButtonGroup = (props) => {
    return (
        <Grid
            className="flex justify-between w-full mt-6"
            item
            lg={12}
            md={12}
            sm={12}
            xs={12}
            spacing={3}
        >
            <Button
                className="mx-5"
                progress={false}
                type="submit"
                startIcon="backspace"
            >
                <span className="capitalize">Clear</span>
            </Button>
            <Button
                style={{ backgroundColor: '#3DB929' }}
                className="mx-5"
                progress={false}
                type="submit"
                startIcon="save"
            >
                <span className="capitalize">Save</span>
            </Button>
        </Grid>
    )
}
