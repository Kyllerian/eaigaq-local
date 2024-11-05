import { forwardRef } from 'react';

const StyledTextField = forwardRef(({label, name, value, onChange, ...props}, ref) => {
    return (
        <TextField
            margin="dense"
            label={label}
            name={name}
            ref={ref}
            value={value}
            onChange={onChange}
            fullWidth
            {...props}
            // multiline
            // rows={4}
        />
    );
});

StyledTextField.displayName = "StyledTextField";

const StyledTextFieldWithoutMargin = forwardRef(({label, name, value, onChange, ...props}, ref) => {
    return (
        <TextField
            label={label}
            name={name}
            ref={ref}
            value={value}
            onChange={onChange}
            fullWidth
            {...props}
            // multiline
            // rows={4}
        />
    );
});

StyledTextFieldWithoutMargin.displayName = "StyledTextFieldWithoutMargin"

export { StyledTextField, StyledTextFieldWithoutMargin }