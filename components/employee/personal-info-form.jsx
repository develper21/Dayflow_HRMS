'use client';

export function PersonalInfoForm({ employee, isEditable = false, onUpdate }) {
    const formatDate = (date) => {
        if (!date) return 'Not provided';
        return new Date(date).toLocaleDateString('en-IN');
    };

    const InfoField = ({ label, value }) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <div className="px-4 py-2 bg-gray-50 rounded border border-gray-200">
                {value || 'Not provided'}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-2 gap-6 p-6">
            {/* Left Column */}
            <div>
                <InfoField label="Login ID" value={employee.loginId} />
                <InfoField label="Email" value={employee.email} />
                <InfoField label="Mobile" value={employee.phone} />
                <InfoField label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
                <InfoField label="Nationality" value={employee.nationality} />
                <InfoField label="Religion" value={employee.religion} />
                <InfoField label="Gender" value={employee.gender} />
                <InfoField label="Marital Status" value={employee.maritalStatus} />
            </div>

            {/* Right Column */}
            <div>
                <InfoField label="Department" value={employee.department} />
                <InfoField label="Designation" value={employee.designation} />
                <InfoField label="Blood Group" value={employee.bloodGroup} />
                <InfoField label="PAN Card" value={employee.panNumber} />
                <InfoField label="Aadhar Number" value={employee.aadharNumber} />
                <InfoField label="Bank Name" value={employee.bankName} />
                <InfoField label="Bank Account" value={employee.accountNumber} />
                <InfoField label="IFSC Code" value={employee.ifscCode} />
                <InfoField label="Date of Joining" value={formatDate(employee.dateOfJoining)} />
            </div>
        </div>
    );
}
