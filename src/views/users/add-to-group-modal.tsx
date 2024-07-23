import { Modal, ModalContent, ModalTitle, Transfer } from '@dhis2/ui';
import styles from './add-to-group-modal.module.css';
import type { FC } from 'react';
import { useState } from 'react';
import { useAuthAxios } from '../../hooks/';
import { Group, User } from '../../types';
import { useAddGroups } from './useAddGroups';

type AddToGroupModalProps = {
    user: User;
    onClose: () => void;
    onComplete: () => void;
};

export const AddToGroupModal: FC<AddToGroupModalProps> = ({ user, onClose, onComplete }) => {
    const [{ data: groups }] = useAuthAxios<Group[]>({
        method: 'GET',
        url: '/groups',
    });

    const { addGroups, addGroupLoading } = useAddGroups();

    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

    const filteredGroups = groups?.filter(group =>
        !user?.groups.some(userGroup => userGroup.name === group.name)
    );

    const groupOptions = filteredGroups?.map(group => ({
        label: group.name,
        value: group.name
    })) || [];

    const onChange = async ({ selected }: { selected: string[] }) => {
        setSelectedGroups(selected);
        await addGroups(selected, user.id);
        onComplete()
        onClose()
    };

    return (
        <Modal onClose={onClose}>
            <ModalTitle>Add user to group</ModalTitle>
            <ModalContent className={styles.container}>
                <Transfer
                    maxSelections={1}
                    loadint={addGroupLoading}
                    options={groupOptions}
                    selected={selectedGroups}
                    leftHeader={<p>Available Groups</p>}
                    rightHeader={<p>Selected Groups</p>}
                    onChange={onChange}
                    disabled={addGroupLoading}
                />
            </ModalContent>
        </Modal>
    );
};
