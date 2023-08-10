class DatabaseTables {
	createTables() {
		const tables = {
			/* Implemented */
			users: {
				username: 'VARCHAR(24)',
				password: 'VARCHAR(1024)',
				token: 'VARCHAR(24)',
				ss_token: 'VARCHAR(7)',
				cloud_token: 'VARCHAR(7)',
				id: {
					type: 'INT',
					increment: true,
					primary: true
				}
			},
			/* Implemented */
			passwords: {
				user_id: 'INT',
				site: 'VARCHAR(128)',
				username: 'VARCHAR(128)',
				email: 'VARCHAR(128)',
				password: 'VARCHAR(1024)',
				trash: 'BOOLEAN',
				createdAt: 'VARCHAR(13)',
				modifiedAt: {
					type: 'VARCHAR(13)',
					null: true
				},
				icon: {
					type: 'VARCHAR(29)',
					null: true
				},
				note: {
					type: 'VARCHAR(2048)',
					null: true
				},
				id: {
					type: 'VARCHAR(24)',
					primary: true
				}
			},
			/* Implemented */
			screenshots: {
				user_id: 'INT',
				name: 'VARCHAR(12)',
				type: 'VARCHAR(4)',
				width: 'VARCHAR(5)',
				height: 'VARCHAR(5)',
				size: 'VARCHAR(512)',
				createdAt: 'VARCHAR(13)',
				favorite: 'BOOLEAN',
				trash: 'BOOLEAN',
				id: {
					type: 'VARCHAR(7)',
					primary: true
				}
			},
			/* Implemented.? */
			mail_accounts: {
				user_id: 'INT',
				address: 'VARCHAR(512)',
				order_index: 'INT',
				visible: 'BOOLEAN',
				id: {
					type: 'INT',
					increment: true,
					primary: true
				}
			},
			/* Implemented */
			mail: {
				user_id: 'INT',
				from_address: 'VARCHAR(512)',
				to_address: 'VARCHAR(512)',
				in_reply_to: {
					type: 'VARCHAR(512)',
					null: true
				},
				isread: 'BOOLEAN',
				favorite: 'BOOLEAN',
				trash: 'BOOLEAN',
				archived: 'BOOLEAN',
				date: 'VARCHAR(13)',
				message_id: 'VARCHAR(512)',
				id: {
					type: 'VARCHAR(24)',
					primary: true
				}
			},
			/* TODO */
			cloud: {
				user_id: 'INT',
				name: 'VARCHAR(512)',
				type: 'VARCHAR(6)',
				size: 'VARCHAR(512)',
				createdAt: 'VARCHAR(13)',
				modifiedAt: 'VARCHAR(13)',
				parent_id: {
					type: 'VARCHAR(24)',
					null: true
				},
				trash: 'BOOLEAN',
				id: {
					type: 'VARCHAR(24)',
					primary: true
				}
			},
			/* REDO */
			cloud_shared: {
				user_id: 'INT',
				file_id: 'VARCHAR(24)',
				password: {
					type: 'VARCHAR(1024)',
					null: true
				},
				id: {
					type: 'VARCHAR(24)',
					primary: true
				}
			},
			/* TODO */
			friend_requests: {
				user_id: 'INT',
				friend_id: 'INT',
				id: {
					type: 'INT',
					increment: true,
					primary: true
				}
			},
			/* TODO */
			friends: {
				user_id: 'INT',
				friend_id: 'INT',
				channel_id: 'VARCHAR(24)',
				id: {
					type: 'INT',
					increment: true,
					primary: true
				}
			},
			/* Implemented */
			channels: {
				owner_id: {
					type: 'INT',
					null: true
				},
				name: {
					type: 'VARCHAR(128)',
					null: true
				},
				type: 'VARCHAR(5)',
				icon: {
					type: 'VARCHAR(24)',
					null: true
				},
				id: {
					type: 'VARCHAR(24)',
					primary: true
				}
			},
			/* No idea how */
			channel_participants: {
				channel_id: 'VARCHAR(24)',
				user_id: 'INT',
				id: {
					type: 'INT',
					increment: true,
					primary: true
				}
			},
			/* wtf was this even used for again */
			friend_channel_id: {
				channel_id: 'VARCHAR(24)',
				user_id: 'INT',
				friend_id: 'INT',
				id: {
					type: 'INT',
					increment: true,
					primary: true
				}
			},
			/* Implemented, kinda */
			messages: {
				author_id: 'INT',
				channel_id: 'VARCHAR(24)',
				content: 'VARCHAR(2048)',
				createdAt: 'VARCHAR(13)',
				editedAt: {
					type: 'VARCHAR(13)',
					null: true
				},
				pinned: 'BOOLEAN',
				reply_id: {
					type: 'VARCHAR(24)',
					null: true
				},
				id: {
					type: 'VARCHAR(24)',
					primary: true
				}
			},
			/* no */
			message_attachments: {
				message_id: 'VARCHAR(24)',
				id: {
					type: 'VARCHAR(24)',
					primary: true
				}
			},
			/* yes */
			settings: {
				user_id: {
					type: 'INT',
					primary: true
				},
				themes: {
					type: 'VARCHAR(2048)',
					null: true
				},
				passwordGenerator: {
					type: 'VARCHAR(2048)',
					null: true
				}
			}
		}

		Object.keys(tables).forEach((tableName) => {
			let query = `CREATE TABLE IF NOT EXISTS ${tableName} (`
			Object.keys(tables[tableName]).forEach((rowName, index) => {
				const row = tables[tableName][rowName]
				let rowSettings = ''
				if (typeof row === 'object') {
					rowSettings = row.type
					if (row.null !== true) rowSettings += ' NOT NULL'
					if (row.increment) rowSettings += ' AUTO_INCREMENT'
					if (row.primary) rowSettings += ' PRIMARY KEY'
				} else {
					rowSettings = `${row} NOT NULL`
				}
				query += `${rowName} ${rowSettings}`
				if (index !== Object.keys(tables[tableName]).length - 1)
					query += ', '
			})
			query += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
			this.query(query)
		})
	}
}

export default DatabaseTables