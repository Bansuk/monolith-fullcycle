import { Router } from "express";
import Address from "../../../modules/@shared/domain/value-object/address";
import ClientRepository from "../../../modules/client-adm/repository/client.repository";
import AddClientUseCase from "../../../modules/client-adm/usecase/add-client/add-client.usecase";

export const clientsRouter = Router();

clientsRouter.post("/", async (req, res) => {
  try {
    const { name, email, document, address } = req.body;
    const repository = new ClientRepository();
    const useCase = new AddClientUseCase(repository);
    const output = await useCase.execute({
      name,
      email,
      document,
      address: new Address(
        address.street,
        address.number,
        address.complement,
        address.city,
        address.state,
        address.zipCode
      ),
    });
    res.status(201).json(output);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
