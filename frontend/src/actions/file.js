import axios from "axios";
import {addFile, setFiles} from "../reducers/fileReducer";

export function getFiles(dirId) {
	return async dispatch => {
		try {
			const response = await axios.get(`http://localhost:8080/api/files${dirId ? '?parent=' + dirId : ''}`, {
				headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
			})
			dispatch(setFiles(response.data))
		} catch (e) {
			alert(e.response.message)
		}
	}
}

export function createDir(dirId, name) {
	return async dispatch => {
		try {
			const response = await axios.post(`http://localhost:8080/api/files`, {
				name,
				parent: dirId,
				type: 'dir'
			}, {
				headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
			})
			dispatch(addFile(response.data))
		} catch (e) {
			alert(e.response.data.message)
		}
	}
}