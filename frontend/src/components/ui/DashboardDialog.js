import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';


export default function DashboardDialog({ open, setOpen, title, children, setState }) {
    const onClose = () => {
        setOpen(false);
        if(setState != null) {
            setState(prevState => {
                const resetState = {};
                Object.keys(prevState).forEach(key => {
                    resetState[key] = ''; // Заменяем каждое поле на пустую строку
                });
                return resetState; // Возвращаем новый объект с пустыми значениями
            });
        }
    }
    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>{children.content}</DialogContent>
                <DialogActions>{children.actions}</DialogActions>
            </Dialog>
        </>
    );
}