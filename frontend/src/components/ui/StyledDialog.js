import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';


export default function StyledDialog({ open, setOpen, title, setState, children }) {
    const onClose = () => {
        setOpen(false);
        setState({ name: '' })
    }
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{children.content}</DialogContent>
            <DialogActions>{children.actions}</DialogActions>
        </Dialog>
    );
}