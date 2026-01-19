'use client';

import { useState } from 'react';

export function ProfileTabs({ activeTab, onTabChange, showSalary = false }) {
    const tabs = [
        { id: 'personal', label: 'Personal Info' },
        ...(showSalary ? [{ id: 'salary', label: 'Salary Info' }] : []),
        { id: 'security', label: 'Security' },
    ];

    return (
        <div className="border-b border-gray-200">
            <div className="flex gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === tab.id
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
